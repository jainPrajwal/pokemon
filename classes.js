class Sprite {
  /**
   *
   * @param {position: {x: number, y: number}, velocity: number, image: any, frames: number }
   * @description frames params means how many frames in a sprite SVG. We have 4 frames in a sprite SVG for player image.
   * @default
   */
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, current: 0, elapsed: 0 },
    sprites = {},
  }) {
    this.position = position;
    this.velocity = velocity;
    this.image = image;
    this.frames = { ...frames, current: 0, elapsed: 0 };
    // make sure that the image is loaded before we start rendering it
    this.image.onload = () => {
      this.width = this.image.width / this.frames.max;
      this.height = this.image.height;
      console.log("heloooooooo", this.image.width, this.image.height);
    };
    this.moving = false;
    this.sprites = sprites;
  }

  //
  draw() {
    // context.drawImage(this.image, this.position.x, this.position.y);
    context.drawImage(
      this.image,
      this.frames.current * this.width, // from left corner
      0, // from top corner
      this.image.width / this.frames.max, // since we have 4 images in sprite and each of them has same width, we divide the  width by 4, since we are making it generic now we cant divide it by 4
      this.image.height, // we want the full height of the original image in the sprite
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max, // what should be the width of the rendered image
      this.image.height // what should be the height of the rendered image
    );

    if (!this.moving) return;
    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }

    if (this.frames.elapsed % 10 === 0) {
      if (this.frames.current < this.frames.max - 1) {
        this.frames.current++;
      } else {
        this.frames.current = 0;
      }
    }
  }
}

class Boundary {
  static width = 48;
  static height = 48;
  constructor(position) {
    this.position = position;
    this.width = Boundary.width; // Initializing this width is important
    this.height = Boundary.height;
  }

  draw() {
    context.fillStyle = `red`;
    context.fillRect(
      this.position.x,
      this.position.y,
      Boundary.width,
      Boundary.height
    );
  }
}
