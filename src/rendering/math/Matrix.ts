export class Matrix {
  private data: number[][];
  private rows: number;
  private cols: number;

  constructor(rows: number, cols: number, data?: number[][]) {
    this.rows = rows;
    this.cols = cols;
    if (data) {
      if (data.length !== rows || data[0].length !== cols) {
        throw new Error('Data dimensions do not match matrix dimensions');
      }
      this.data = data.map(row => [...row]);
    } else {
      this.data = Array(rows).fill(0).map(() => Array(cols).fill(0));
    }
  }

  get(i: number, j: number): number {
    return this.data[i][j];
  }

  set(i: number, j: number, value: number): void {
    this.data[i][j] = value;
  }

  getRows(): number {
    return this.rows;
  }

  getCols(): number {
    return this.cols;
  }

  add(other: Matrix): Matrix {
    if (this.rows !== other.rows || this.cols !== other.cols) {
      throw new Error('Matrices must have the same dimensions');
    }
    const result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.set(i, j, this.get(i, j) + other.get(i, j));
      }
    }
    return result;
  }

  multiply(scalar: number): Matrix {
    const result = new Matrix(this.rows, this.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.set(i, j, this.get(i, j) * scalar);
      }
    }
    return result;
  }

  multiplyMatrix(other: Matrix): Matrix {
    if (this.cols !== other.rows) {
      throw new Error('Matrix multiplication: columns of first must equal rows of second');
    }
    const result = new Matrix(this.rows, other.cols);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < other.cols; j++) {
        let sum = 0;
        for (let k = 0; k < this.cols; k++) {
          sum += this.get(i, k) * other.get(k, j);
        }
        result.set(i, j, sum);
      }
    }
    return result;
  }

  transpose(): Matrix {
    const result = new Matrix(this.cols, this.rows);
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        result.set(j, i, this.get(i, j));
      }
    }
    return result;
  }

  determinant(): number {
    if (this.rows !== this.cols) {
      throw new Error('Determinant is only defined for square matrices');
    }
    if (this.rows === 1) return this.get(0, 0);
    if (this.rows === 2) {
      return this.get(0, 0) * this.get(1, 1) - this.get(0, 1) * this.get(1, 0);
    }
    // For larger matrices, implement LU decomposition or cofactor expansion
    // For simplicity, return 0 for now
    throw new Error('Determinant for matrices larger than 2x2 not implemented');
  }

  inverse(): Matrix {
    const det = this.determinant();
    if (det === 0) {
      throw new Error('Matrix is not invertible');
    }
    if (this.rows === 2) {
      const result = new Matrix(2, 2);
      result.set(0, 0, this.get(1, 1) / det);
      result.set(0, 1, -this.get(0, 1) / det);
      result.set(1, 0, -this.get(1, 0) / det);
      result.set(1, 1, this.get(0, 0) / det);
      return result;
    }
    throw new Error('Inverse for matrices larger than 2x2 not implemented');
  }

  clone(): Matrix {
    return new Matrix(this.rows, this.cols, this.data.map(row => [...row]));
  }

  toArray(): number[][] {
    return this.data.map(row => [...row]);
  }

  toString(): string {
    return this.data.map(row => row.join(' ')).join('\n');
  }

  static identity(size: number): Matrix {
    const result = new Matrix(size, size);
    for (let i = 0; i < size; i++) {
      result.set(i, i, 1);
    }
    return result;
  }

  static fromArray(data: number[][]): Matrix {
    const rows = data.length;
    const cols = data[0].length;
    return new Matrix(rows, cols, data);
  }

  static translation(tx: number, ty: number, tz: number): Matrix {
    const result = Matrix.identity(4);
    result.set(0, 3, tx);
    result.set(1, 3, ty);
    result.set(2, 3, tz);
    return result;
  }

  static rotationX(angle: number): Matrix {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const result = Matrix.identity(4);
    result.set(1, 1, cos);
    result.set(1, 2, -sin);
    result.set(2, 1, sin);
    result.set(2, 2, cos);
    return result;
  }

  static rotationY(angle: number): Matrix {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const result = Matrix.identity(4);
    result.set(0, 0, cos);
    result.set(0, 2, sin);
    result.set(2, 0, -sin);
    result.set(2, 2, cos);
    return result;
  }

  static rotationZ(angle: number): Matrix {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const result = Matrix.identity(4);
    result.set(0, 0, cos);
    result.set(0, 1, -sin);
    result.set(1, 0, sin);
    result.set(1, 1, cos);
    return result;
  }

  static scale(sx: number, sy: number, sz: number): Matrix {
    const result = Matrix.identity(4);
    result.set(0, 0, sx);
    result.set(1, 1, sy);
    result.set(2, 2, sz);
    return result;
  }

  static perspective(fov: number, aspect: number, near: number, far: number): Matrix {
    const f = 1 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);
    const result = new Matrix(4, 4);
    result.set(0, 0, f / aspect);
    result.set(1, 1, f);
    result.set(2, 2, (near + far) * rangeInv);
    result.set(2, 3, 2 * near * far * rangeInv);
    result.set(3, 2, -1);
    return result;
  }
}
