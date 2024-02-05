const canvas = document.querySelector(`canvas`);
canvas.width = 1024;
canvas.height = 576;
const context = canvas.getContext("2d");

const offset = {
  x: -720,
  y: -600,
};

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

/**
 * i + 70, because our map is 70 tiles wide
 */

let collisionsMap = [];
for (let i = 0; i < Collisions.length; i = i + 70) {
  const slicedArray = Collisions.slice(i, 70 + i);
  collisionsMap.push(slicedArray);
}
const boundaries = [];

collisionsMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    // === 1025 because in the collisions array wherever there is 1025 it resembles a boundary
    if (symbol === 1025) {
      boundaries.push(
        new Boundary({
          x: j * Boundary.width + offset.x, // Boundary.width because 48 is the width of eac collision as weh have mentiond in Boundary class
          y: i * Boundary.height + offset.y,
        })
      );
    }
  });
});

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
  /**
   *
   * @param {position: {x: number, y: number}, velocity: number, image: any, frames: number }
   * @description frames params means how many frames in a sprite SVG. We have 4 frames in a sprite SVG for player image.
   * @default {..., frames: {max: 1}}
   */
  constructor({ position, velocity, image, frames = { max: 1 } }) {
    this.position = position;
    this.velocity = velocity;
    this.image = image;
    this.frames = frames;
    // make sure that the image is loaded before we start rendering it
    this.image.onload = () => {
      this.width = this.image.width / this.frames.max;
      this.height = this.image.height;
      console.log(this.image.width, this.image.height);
    };
  }

  //
  draw() {
    // context.drawImage(this.image, this.position.x, this.position.y);
    context.drawImage(
      this.image,
      0, // from left corner
      0, // from top corner
      this.image.width / this.frames.max, // since we have 4 images in sprite and each of them has same width, we divide the  width by 4, since we are making it generic now we cant divide it by 4
      this.image.height, // we want the full height of the original image in the sprite
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max, // what should be the width of the rendered image
      this.image.height // what should be the height of the rendered image
    );
  }
}

const playerSprite = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2, // start rendering the image in canvas from middle of the canvas screen
    y: canvas.height / 2 - 68 / 2,
  },
  image: playerImage,
  frames: {
    max: 4,
  },
});

const backgroundSprite = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: pelletTownImageSource,
});

// const testBoundary = new Boundary({
//   x: 400,
//   y: 400,
// });

// const movablesList = [backgroundSprite, testBoundary];
const movablesList = [backgroundSprite, ...boundaries];

function detectRectangularCollisions({ player, boundary }) {
  // Player Coords
  const leftSideOfPlayer = player.position.x;
  const rightSideOfPlayer = leftSideOfPlayer + player.width;
  const topOfPlayer = player.position.y;
  const bottomOfPlayer = topOfPlayer + player.height;

  // Boundary Coords
  const leftSideOfBoundary = boundary.position.x;
  const rightSideOfBoundary = leftSideOfBoundary + boundary.width;
  const topOfBoundary = boundary.position.y;
  const bottomOfBoundary = topOfBoundary + boundary.height;

  const isRightSideOfPlayerCollidingWithLeftSideOfBoundary =
    rightSideOfPlayer >= leftSideOfBoundary;

  const isBottomOfPlayerCollidingWithTopOfBoundary =
    bottomOfPlayer >= topOfBoundary;

  const ensurePlayerIsBehindBoundary = leftSideOfPlayer <= rightSideOfBoundary;
  const ensurePlayerIsBelowBoundary = topOfPlayer <= bottomOfBoundary;

  const areTwoObjectsColliding =
    isRightSideOfPlayerCollidingWithLeftSideOfBoundary &&
    ensurePlayerIsBehindBoundary &&
    ensurePlayerIsBelowBoundary &&
    isBottomOfPlayerCollidingWithTopOfBoundary;

  return areTwoObjectsColliding;
}
function rectangularCollisions({ player, boundary }) {
  return (
    player.position.x + player.width >= boundary.position.x &&
    player.position.x <= boundary.position.x + boundary.width &&
    player.position.y <= boundary.position.y + boundary.height &&
    player.position.y + player.height >= boundary.position.y
  );
}

function animate() {
  requestAnimationFrame(animate);

  backgroundSprite.draw();

  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  // testBoundary.draw();
  playerSprite.draw();
  let playerColliding = false;
  if (
    keys.upNavigation.pressed &&
    (lastKeyPressed === `w` || lastKeyPressed === `ArrowUp`)
  ) {
    const getDisplacement =
      (shouldIncreaseSpeed, byUnits = { slow: 5, fast: 10 }) =>
      (movable) => {
        let displacement = (movable.position.y += byUnits.slow);
        if (shouldIncreaseSpeed) {
          displacement = movable.position.y += byUnits.fast;
        }
        return displacement;
      };
    navigate({
      boundaries,
      movablesList,
      shouldIncreaseSpeed,
      playerSprite,
      direction: "up",
      getDisplacement,
    });
  } else if (
    keys.downNavigation.pressed &&
    (lastKeyPressed === `s` || lastKeyPressed === `ArrowDown`)
  ) {
    const getDisplacement =
      (shouldIncreaseSpeed, byUnits = { slow: 5, fast: 10 }) =>
      (movable) => {
        let displacement = (movable.position.y -= byUnits.slow);
        if (shouldIncreaseSpeed) {
          displacement = movable.position.y -= byUnits.fast;
        }
        return displacement;
      };
    navigate({
      boundaries,

      movablesList,
      shouldIncreaseSpeed,
      playerSprite,
      direction: "down",
      getDisplacement,
    });
    // if (shouldIncreaseSpeed) {
    //   // backgroundSprite.position.y -= 10;
    //   movablesList.forEach((movable) => (movable.position.y -= 10));
    // } else {
    //   movablesList.forEach((movable) => (movable.position.y -= 5));
    //   // backgroundSprite.position.y -= 5;
    // }
  } else if (
    keys.leftNavigation.pressed &&
    (lastKeyPressed === `a` || lastKeyPressed === `ArrowLeft`)
  ) {
    const getDisplacement =
      (shouldIncreaseSpeed, byUnits = { slow: 5, fast: 10 }) =>
      (movable) => {
        let displacement = (movable.position.x += byUnits.slow);
        if (shouldIncreaseSpeed) {
          displacement = movable.position.x += byUnits.fast;
        }
        return displacement;
      };
    navigate({
      boundaries,
      // playerColliding,
      movablesList,
      shouldIncreaseSpeed,
      playerSprite,
      direction: "left",
      getDisplacement,
    });
  } else if (
    keys.rightNavigation.pressed &&
    (lastKeyPressed === `d` || lastKeyPressed === `ArrowRight`)
  ) {
    const getDisplacement =
      (shouldIncreaseSpeed, byUnits = { slow: 5, fast: 10 }) =>
      (movable) => {
        let displacement = (movable.position.x -= byUnits.slow);
        if (shouldIncreaseSpeed) {
          displacement = movable.position.x -= byUnits.fast;
        }
        return displacement;
      };
    navigate({
      boundaries,
      // playerColliding,
      movablesList,
      shouldIncreaseSpeed,
      playerSprite,
      direction: "right",
      getDisplacement,
    });
  }
}

animate();

// When the key is pressed, we need to move the player. So we need to set the pressed property of the respective key to true
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
      console.log(`no function associated with the key `, event.key);
  }
});

// When the key is released, we need to stop the movement of the player. So we need to set the pressed property of the respective key to false
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
      console.log(`no function associated with the key `, event.key);
  }
});

function navigate({
  boundaries,

  shouldIncreaseSpeed,
  movablesList,
  playerSprite,
  direction,
  getDisplacement,
  byUnits,
}) {
  let playerColliding = false;
  for (let i = 0; i < boundaries.length; i++) {
    if (playerColliding) {
      break; // if player is colliding, then break out of the loop. We dont need to check with each other boundary if the player is colliding. At a time a player can only collide with one boundary and we have got that. So break.
    } else {
      const currentBoundary = boundaries[i];
      let params = {};

      switch (direction) {
        case "up":
          {
            params = {
              player: playerSprite,
              boundary: {
                ...currentBoundary,
                position: {
                  x: currentBoundary.position.x,
                  y: currentBoundary.position.y + 5,
                },
              },
            };
          }
          break;

        case "down":
          {
            params = {
              player: playerSprite,
              boundary: {
                ...currentBoundary,
                position: {
                  x: currentBoundary.position.x,
                  y: currentBoundary.position.y - 15,
                },
              },
            };
          }
          break;

        case "left":
          {
            params = {
              player: playerSprite,
              boundary: {
                ...currentBoundary,
                position: {
                  x: currentBoundary.position.x + 5,
                  y: currentBoundary.position.y,
                },
              },
            };
          }
          break;

        case "right":
          {
            params = {
              player: playerSprite,
              boundary: {
                ...currentBoundary,
                position: {
                  x: currentBoundary.position.x - 5,
                  y: currentBoundary.position.y,
                },
              },
            };
          }
          break;

        default:
          throw new Error("Direction to navigate not found ");
      }
      console.log({ params });
      if (rectangularCollisions(params)) {
        console.log("colliding");
        playerColliding = true;
        break;
      }
    }
  }
  if (!playerColliding) {
    movablesList.forEach(getDisplacement(shouldIncreaseSpeed, byUnits));
    // backgroundSprite.position.y += 10;
  }
}
