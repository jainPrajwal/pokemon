const canvas = document.querySelector(`canvas`);
canvas.width = 1024;
canvas.height = 576;
const context = canvas.getContext("2d");

context.fillStyle = "white";

context.fillRect(0, 0, canvas.width, canvas.height);

const pelletTownImageSource = new Image();
pelletTownImageSource.src = `./images/Pellet Town Zoomed.png`;
const playerImage = new Image();
playerImage.src = "./images/playerDown.png";


/**
 * Listen to keydown event on w,a,s,d
 * Then need to add an animation loop which can change our image coordinates and each time the coordinates change we will go through a new iteration of the loop and whenever we enter a new frame
 * if our images have different coordinates its going to give off the illusion that the player or the backgrounf image is moving
 *
 *
 * Create a new function animate
 */

class Sprite {
  constructor({ position, velocity, image }) {
    this.position = position;
    this.velocity = velocity;
    this.image = image;
  }

  // 
  draw() {
    context.drawImage(this.image, -735, -600);
  }
}

const backgroundSprite = new Sprite({
  position: {
    x: -735,
    y: -600,
  },
  image: pelletTownImageSource
});

function animate() {
  requestAnimationFrame(animate);

  backgroundSprite.draw()
  context.drawImage(
    playerImage,
    0, // from left corner
    0, // from top corner
    playerImage.width / 4, // since we have 4 images in sprite and each of them has same width, we divide the  width by 4
    playerImage.height, // we want the full height of the original image in the sprite
    canvas.width / 2 - playerImage.width / 4 / 2, // start rendering the image in canvas from middle of the canvas screen
    canvas.height / 2 - playerImage.height / 2,
    playerImage.width / 4, // what should be the width of the rendered image
    playerImage.height // what should be the height of the rendered image
  );
}

animate();
