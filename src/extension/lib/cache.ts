export default class Cache {
  private value: any;

  public set(value) {
    this.value = value;
  }

  public get() {
    return this.value;
  }

  public clear() {
    this.value = null;
  }
}
