import { between } from "@helpers/math";

export class Paginator {
  private data: any[];
  private len: number;
  private width: number;

  page = $state(0);
  pages = $state(0);
  start = $state(0);
  end = $state(0);
  limit = 0;
  labels: number[] = $state([]);

  constructor(dt?: any[], limit?: number, paginatorWidth?: number) {
    this.data = Array.isArray(dt) ? dt : [];
    this.len = this.data.length;
    this.width = paginatorWidth || 5;
    this.limit = Math.abs(~~(limit || 0)) || 10;

    this.update(0);
  }

  private update(len: number) {
    this.len = len;

    this.pages = Math.ceil(this.len / this.limit);

    this.page = between(this.page, 1, this.pages);
    this.start = (this.page - 1) * this.limit;
    this.end = this.start + this.limit;

    const minL = Math.max(1, this.page - (this.width >> 1)); // min label
    const maxL = Math.min(this.pages, minL + this.width - 1); // max label

    this.labels.length = 0;

    for (let i = minL; i <= maxL; i += 1) {
      this.labels.push(i);
    }
  }

  setData(d: any[]) {
    this.data = d;
    this.update(d.length);
  }

  setPage(p: number) {
    this.page = p;
    this.update(this.len);
  }

  setTotal(len: number) {
    this.update(len);
  }

  nextPage() {
    this.setPage(this.page + 1);
  }

  prevPage() {
    this.setPage(this.page - 1);
  }
}
