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

let lastKeyPressed = null;
let shouldIncreaseSpeed = false;
const keys = {
  leftNavigation: {
    pressed: false,
  },
  rightNavigation: {
    pressed: false,
  },
  upNavigation: {
    pressed: false,
  },
  downNavigation: {
    pressed: false,
  },
};

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
    context.drawImage(this.image, this.position.x, this.position.y);
  }
}

const backgroundSprite = new Sprite({
  position: {
    x: -735,
    y: -600,
  },
  image: pelletTownImageSource,
});

function animate() {
  requestAnimationFrame(animate);

  backgroundSprite.draw();
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

  if (
    keys.upNavigation.pressed &&
    (lastKeyPressed === `w` || lastKeyPressed === `ArrowUp`)
  ) {
    if (shouldIncreaseSpeed) {
      backgroundSprite.position.y += 10;
    } else {
      backgroundSprite.position.y += 5;
    }
  } else if (
    keys.downNavigation.pressed &&
    (lastKeyPressed === `s` || lastKeyPressed === `ArrowDown`)
  ) {
    if (shouldIncreaseSpeed) {
      backgroundSprite.position.y -= 10;
    } else {
      backgroundSprite.position.y -= 5;
    }
  } else if (
    keys.leftNavigation.pressed &&
    (lastKeyPressed === `a` || lastKeyPressed === `ArrowLeft`)
  ) {
    if (shouldIncreaseSpeed) {
      backgroundSprite.position.x += 10;
    } else {
      backgroundSprite.position.x += 5;
    }
  } else if (
    keys.rightNavigation.pressed &&
    (lastKeyPressed === `d` || lastKeyPressed === `ArrowRight`)
  ) {
    if (shouldIncreaseSpeed) {
      backgroundSprite.position.x -= 10;
    } else {
      backgroundSprite.position.x -= 5;
    }
  }
}

animate();

window.addEventListener("keydown", function (event) {
  switch (event.key) {
    case `w`:
      lastKeyPressed = `w`;
    case `ArrowUp`:
      keys.upNavigation.pressed = true;
      lastKeyPressed = `ArrowUp`;
      break;
    case `a`:
      lastKeyPressed = `a`;
    case `ArrowLeft`:
      lastKeyPressed = `ArrowLeft`;
      keys.leftNavigation.pressed = true;
      break;
    case `s`:
      lastKeyPressed = `s`;
    case `ArrowDown`:
      lastKeyPressed = `ArrowDown`;
      keys.downNavigation.pressed = true;
      break;
    case `d`:
      lastKeyPressed = `d`;
    case `ArrowRight`:
      lastKeyPressed = `ArrowRight`;
      keys.rightNavigation.pressed = true;
      break;

    case `Shift`:
      shouldIncreaseSpeed = true;
    default:
      console.error(`no function associated with the key `, event.key);
  }
});

window.addEventListener("keyup", function (event) {
  switch (event.key) {
    case `w`:
    case `ArrowUp`:
      keys.upNavigation.pressed = false;
      break;
    case `a`:
    case `ArrowLeft`:
      keys.leftNavigation.pressed = false;
      break;
    case `s`:
    case `ArrowDown`:
      keys.downNavigation.pressed = false;
      break;
    case `d`:
    case `ArrowRight`:
      keys.rightNavigation.pressed = false;
      break;

    case `Shift`:
      shouldIncreaseSpeed = false;
    default:
      console.error(`no function associated with the key `, event.key);
  }
});
