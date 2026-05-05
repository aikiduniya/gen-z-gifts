export class Vector {
  private components: number[];

  constructor(components: number[]) {
    this.components = [...components];
  }

  get dimension(): number {
    return this.components.length;
  }

  get x(): number {
    return this.components[0] || 0;
  }

  get y(): number {
    return this.components[1] || 0;
  }

  get z(): number {
    return this.components[2] || 0;
  }

  get w(): number {
    return this.components[3] || 0;
  }

  set x(value: number) {
    this.components[0] = value;
  }

  set y(value: number) {
    this.components[1] = value;
  }

  set z(value: number) {
    this.components[2] = value;
  }

  set w(value: number) {
    this.components[3] = value;
  }

  get(i: number): number {
    return this.components[i] || 0;
  }

  set(i: number, value: number): void {
    this.components[i] = value;
  }

  add(other: Vector): Vector {
    if (this.dimension !== other.dimension) {
      throw new Error('Vectors must have the same dimension');
    }
    const result = this.components.map((c, i) => c + other.components[i]);
    return new Vector(result);
  }

  subtract(other: Vector): Vector {
    if (this.dimension !== other.dimension) {
      throw new Error('Vectors must have the same dimension');
    }
    const result = this.components.map((c, i) => c - other.components[i]);
    return new Vector(result);
  }

  multiply(scalar: number): Vector {
    const result = this.components.map(c => c * scalar);
    return new Vector(result);
  }

  dot(other: Vector): number {
    if (this.dimension !== other.dimension) {
      throw new Error('Vectors must have the same dimension');
    }
    return this.components.reduce((sum, c, i) => sum + c * other.components[i], 0);
  }

  cross(other: Vector): Vector {
    if (this.dimension !== 3 || other.dimension !== 3) {
      throw new Error('Cross product is only defined for 3D vectors');
    }
    const [x1, y1, z1] = this.components;
    const [x2, y2, z2] = other.components;
    return new Vector([
      y1 * z2 - z1 * y2,
      z1 * x2 - x1 * z2,
      x1 * y2 - y1 * x2
    ]);
  }

  magnitude(): number {
    return Math.sqrt(this.dot(this));
  }

  normalize(): Vector {
    const mag = this.magnitude();
    if (mag === 0) return new Vector(this.components.map(() => 0));
    return this.multiply(1 / mag);
  }

  clone(): Vector {
    return new Vector([...this.components]);
  }

  toArray(): number[] {
    return [...this.components];
  }

  toString(): string {
    return `Vector(${this.components.join(', ')})`;
  }

  static zero(dim: number): Vector {
    return new Vector(new Array(dim).fill(0));
  }

  static one(dim: number): Vector {
    return new Vector(new Array(dim).fill(1));
  }

  static fromArray(arr: number[]): Vector {
    return new Vector(arr);
  }
}
