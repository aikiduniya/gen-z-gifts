export class Tensor {
  private data: number[];
  private shape: number[];

  constructor(shape: number[], data?: number[]) {
    this.shape = [...shape];
    const totalSize = this.shape.reduce((a, b) => a * b, 1);
    if (data) {
      if (data.length !== totalSize) {
        throw new Error('Data length does not match shape');
      }
      this.data = [...data];
    } else {
      this.data = new Array(totalSize).fill(0);
    }
  }

  getShape(): number[] {
    return [...this.shape];
  }

  getSize(): number {
    return this.data.length;
  }

  get(...indices: number[]): number {
    const index = this.getFlatIndex(indices);
    return this.data[index];
  }

  set(value: number, ...indices: number[]): void {
    const index = this.getFlatIndex(indices);
    this.data[index] = value;
  }

  private getFlatIndex(indices: number[]): number {
    if (indices.length !== this.shape.length) {
      throw new Error('Number of indices must match tensor dimensions');
    }
    let index = 0;
    let stride = 1;
    for (let i = this.shape.length - 1; i >= 0; i--) {
      if (indices[i] < 0 || indices[i] >= this.shape[i]) {
        throw new Error('Index out of bounds');
      }
      index += indices[i] * stride;
      stride *= this.shape[i];
    }
    return index;
  }

  add(other: Tensor): Tensor {
    if (!this.shapesEqual(other)) {
      throw new Error('Tensors must have the same shape');
    }
    const result = new Tensor(this.shape);
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i] + other.data[i];
    }
    return result;
  }

  multiply(scalar: number): Tensor {
    const result = new Tensor(this.shape);
    for (let i = 0; i < this.data.length; i++) {
      result.data[i] = this.data[i] * scalar;
    }
    return result;
  }

  dot(other: Tensor): Tensor {
    // Simplified dot product for vectors
    if (this.shape.length !== 1 || other.shape.length !== 1 || this.shape[0] !== other.shape[0]) {
      throw new Error('Dot product requires 1D tensors of same length');
    }
    let sum = 0;
    for (let i = 0; i < this.data.length; i++) {
      sum += this.data[i] * other.data[i];
    }
    return new Tensor([1], [sum]);
  }

  reshape(newShape: number[]): Tensor {
    const newSize = newShape.reduce((a, b) => a * b, 1);
    if (newSize !== this.getSize()) {
      throw new Error('New shape must have the same total size');
    }
    return new Tensor(newShape, [...this.data]);
  }

  clone(): Tensor {
    return new Tensor(this.shape, [...this.data]);
  }

  toArray(): number[] {
    return [...this.data];
  }

  toString(): string {
    return `Tensor(shape: [${this.shape.join(', ')}], data: [${this.data.join(', ')}])`;
  }

  private shapesEqual(other: Tensor): boolean {
    if (this.shape.length !== other.shape.length) return false;
    for (let i = 0; i < this.shape.length; i++) {
      if (this.shape[i] !== other.shape[i]) return false;
    }
    return true;
  }

  static zeros(shape: number[]): Tensor {
    return new Tensor(shape);
  }

  static ones(shape: number[]): Tensor {
    const size = shape.reduce((a, b) => a * b, 1);
    return new Tensor(shape, new Array(size).fill(1));
  }

  static fromArray(shape: number[], data: number[]): Tensor {
    return new Tensor(shape, data);
  }
}
