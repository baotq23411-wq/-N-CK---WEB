import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';
import { ReviewService } from '../services/review';
import { UserService } from '../services/user';
import { AuthService } from '../services/auth';
import { ReviewListItem } from '../models/review';

@Component({
  selector: 'app-review-room',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './review-room.html',
  styleUrls: ['./review-room.css'],
})
export class ReviewRoom implements OnInit {
  reviewForm!: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];
  recentReviews: ReviewListItem[] = [];
  isLoading = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private reviewService: ReviewService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Kiểm tra đăng nhập
    // Tạm thời comment để test UI (bỏ comment khi deploy)
    // if (!this.authService.isLoggedIn()) {
    //   this.router.navigate(['/login']);
    //   return;
    // }

    this.loadReviews();
    
    // Lấy bookingId từ query params nếu có
    this.route.queryParams.subscribe((params) => {
      if (params['bookingId']) {
        this.reviewForm.patchValue({ bookingId: params['bookingId'] });
      }
    });

    // Load draft từ localStorage nếu có
    this.loadDraft();
  }

  initForm(): void {
    this.reviewForm = this.fb.group({
      rating: [0, [Validators.required, this.ratingValidator]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      images: [[]],
      isPublic: [true],
      bookingId: [''],
    });
  }

  ratingValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === 0) {
      return { required: true };
    }
    if (value < 1 || value > 5) {
      return { invalidRange: true };
    }
    return null;
  }

  get rating() {
    return this.reviewForm.get('rating');
  }

  get content() {
    return this.reviewForm.get('content');
  }

  setRating(value: number): void {
    this.reviewForm.patchValue({ rating: value });
    this.reviewForm.get('rating')?.markAsTouched();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  handleFiles(files: File[]): void {
    const maxFiles = 3;
    const maxSize = 2 * 1024 * 1024; // 2MB

    // Kiểm tra số lượng file
    if (this.selectedFiles.length + files.length > maxFiles) {
      Swal.fire({
        title: 'Lỗi',
        text: `Bạn chỉ có thể đính kèm tối đa ${maxFiles} ảnh.`,
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    // Kiểm tra từng file
    for (const file of files) {
      if (this.selectedFiles.length >= maxFiles) {
        break;
      }

      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          title: 'Lỗi',
          text: `File "${file.name}" không phải là ảnh.`,
          icon: 'error',
          confirmButtonText: 'OK',
        });
        continue;
      }

      // Kiểm tra kích thước
      if (file.size > maxSize) {
        Swal.fire({
          title: 'Lỗi',
          text: `Ảnh "${file.name}" vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn.`,
          icon: 'error',
          confirmButtonText: 'OK',
        });
        continue;
      }

      this.selectedFiles.push(file);
      this.createPreview(file);
    }

    this.reviewForm.patchValue({ images: this.selectedFiles });
  }

  createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.imagePreviews.push(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }

  removeImage(index: number): void {
    this.selectedFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
    this.reviewForm.patchValue({ images: this.selectedFiles });
  }

  formatFiles(): FormData {
    const formData = new FormData();
    const UID = localStorage.getItem('UID') || '';

    formData.append('userId', UID);
    formData.append('rating', this.reviewForm.get('rating')?.value.toString());
    formData.append('content', this.reviewForm.get('content')?.value);
    formData.append('isPublic', this.reviewForm.get('isPublic')?.value.toString());

    const bookingId = this.reviewForm.get('bookingId')?.value;
    if (bookingId) {
      formData.append('bookingId', bookingId);
    }

    // Append images
    this.selectedFiles.forEach((file, index) => {
      formData.append(`images`, file);
    });

    return formData;
  }

  submitReview(): void {
    // Kiểm tra đăng nhập lại
    if (!this.authService.isLoggedIn()) {
      Swal.fire({
        title: 'Chưa đăng nhập',
        text: 'Vui lòng đăng nhập để gửi đánh giá.',
        icon: 'warning',
        confirmButtonText: 'Đăng nhập',
        showCancelButton: true,
        cancelButtonText: 'Hủy',
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }

    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      
      // Hiển thị lỗi cụ thể
      if (this.rating?.hasError('required')) {
        Swal.fire({
          title: 'Lỗi',
          text: 'Vui lòng chọn số sao đánh giá.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      } else if (this.content?.hasError('minlength')) {
        Swal.fire({
          title: 'Lỗi',
          text: 'Nội dung đánh giá phải có ít nhất 20 ký tự.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
      return;
    }

    this.isSubmitting = true;
    const formData = this.formatFiles();

    // Lưu draft trước khi gửi
    this.saveDraft();

    this.reviewService.registerReview(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        if (response.success) {
          // Xóa draft
          this.clearDraft();

          // Thêm điểm nếu có
          if (response.pointsAdded && response.pointsAdded > 0) {
            this.userService.addPoints(response.pointsAdded).subscribe();
          }

          // Hiển thị thông báo thành công
          Swal.fire({
            title: 'Thành công!',
            text: response.pointsAdded 
              ? `Đánh giá của bạn đã được gửi. Bạn nhận được ${response.pointsAdded} điểm thưởng!`
              : 'Đánh giá của bạn đã được gửi thành công.',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            // Refresh reviews
            this.loadReviews();
            
            // Reset form
            this.reviewForm.reset();
            this.reviewForm.patchValue({ rating: 0, isPublic: true });
            this.selectedFiles = [];
            this.imagePreviews = [];

            // Chuyển hướng về trang chi tiết phòng hoặc profile
            const bookingId = this.reviewForm.get('bookingId')?.value;
            if (bookingId) {
              // Có thể chuyển về trang chi tiết phòng
              this.router.navigate(['/']);
            } else {
              this.router.navigate(['/']);
            }
          });
        }
      },
      error: (error) => {
        this.isSubmitting = false;
        
        // Lưu draft khi lỗi
        this.saveDraft();

        let errorMessage = 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.';
        let errorTitle = 'Lỗi';

        if (error.error) {
          if (error.error.message === 'Duplicate review' || error.error.message?.includes('đã đánh giá')) {
            errorTitle = 'Đánh giá đã tồn tại';
            errorMessage = 'Bạn đã đánh giá cho đặt phòng này rồi. Bạn có muốn sửa đánh giá không?';
            
            Swal.fire({
              title: errorTitle,
              text: errorMessage,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Sửa đánh giá',
              cancelButtonText: 'Hủy',
            }).then((result) => {
              if (result.isConfirmed) {
                // Có thể điều hướng đến trang sửa đánh giá
                this.router.navigate(['/']);
              }
            });
            return;
          } else if (error.error.message === 'Unauthorized' || error.error.message === 'Chưa đăng nhập') {
            errorTitle = 'Chưa đăng nhập';
            errorMessage = 'Vui lòng đăng nhập để gửi đánh giá.';
            
            Swal.fire({
              title: errorTitle,
              text: errorMessage,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonText: 'Đăng nhập',
              cancelButtonText: 'Hủy',
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/login']);
              }
            });
            return;
          } else {
            errorMessage = error.error.message || errorMessage;
          }
        }

        Swal.fire({
          title: errorTitle,
          text: errorMessage,
          icon: 'error',
          confirmButtonText: 'OK',
        });
      },
    });
  }

  loadReviews(): void {
    this.isLoading = true;
    this.reviewService.getRecentReviews(undefined, 5).subscribe({
      next: (reviews) => {
        this.recentReviews = reviews;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        // Không hiển thị lỗi nếu không load được reviews
        console.error('Error loading reviews:', error);
      },
    });
  }

  saveDraft(): void {
    const draft = {
      rating: this.reviewForm.get('rating')?.value,
      content: this.reviewForm.get('content')?.value,
      isPublic: this.reviewForm.get('isPublic')?.value,
      bookingId: this.reviewForm.get('bookingId')?.value,
    };
    localStorage.setItem('reviewDraft', JSON.stringify(draft));
  }

  loadDraft(): void {
    const draftStr = localStorage.getItem('reviewDraft');
    if (draftStr) {
      try {
        const draft = JSON.parse(draftStr);
        this.reviewForm.patchValue(draft);
      } catch (e) {
        // Ignore parse errors
      }
    }
  }

  clearDraft(): void {
    localStorage.removeItem('reviewDraft');
  }

  viewMoreReviews(): void {
    // Có thể điều hướng đến trang danh sách đánh giá đầy đủ
    this.router.navigate(['/']);
  }

  openImage(imageUrl: string): void {
    window.open(imageUrl, '_blank');
  }
}