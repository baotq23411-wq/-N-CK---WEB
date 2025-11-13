import { Component, AfterViewInit, OnDestroy, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './policy.html',
  styleUrl: './policy.css',
})
export class Policy implements AfterViewInit, OnDestroy {
  updated = new Date().toLocaleDateString('vi-VN');
  private io?: IntersectionObserver;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const host = this.el.nativeElement;
    const links = Array.from(host.querySelectorAll<HTMLAnchorElement>('.toc-list a'));
    const ids = links.map(a => a.getAttribute('href') || '')
                     .filter(h => h.startsWith('#'))
                     .map(h => h.slice(1));
    const sections = ids
      .map(id => host.querySelector<HTMLElement>('#' + id))
      .filter((s): s is HTMLElement => !!s);

    const activate = (id: string) => {
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    };

    this.io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) activate((e.target as HTMLElement).id);
      }
    }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 1] });

    sections.forEach(sec => this.io!.observe(sec));

    // smooth scroll
    links.forEach(a => {
      a.addEventListener('click', (ev) => {
        const href = a.getAttribute('href') || '';
        if (href.startsWith('#')) {
          ev.preventDefault();
          const target = host.querySelector(href);
          target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          history.replaceState(null, '', href);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }
}
