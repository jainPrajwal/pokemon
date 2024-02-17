const canvas = document.querySelector(`canvas`);
canvas.width = 1024;
canvas.height = 576;
const context = canvas.getContext("2d");

const offset = {
  x: -740,
  y: -640,
};

/**
 * i + 70, because our map is 70 tiles wide
 */

let collisionsMap = [];
/**
 * i + 70, because our map is 70 tiles wide
 * this will be an array of arrays
 */
const battleZonesMap = [];
for (let i = 0; i < COLLISIONS_DATA.length; i = i + 70) {
  const slicedArray = COLLISIONS_DATA.slice(i, 70 + i);
  collisionsMap.push(slicedArray);
}

// get the rectangle in which we want our player to activate the battle
for (let i = 0; i < BATTLE_ZONES_DATA.length; i = i + 70) {
  const slicedArray = BATTLE_ZONES_DATA.slice(i, 70 + i);
  battleZonesMap.push(slicedArray);
}

// start pushing in battle zone tiles into battlezones array

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

const battleZones = [];

battleZonesMap.forEach((row, i) => {
  row.forEach((symbol, j) => {
    // === 1025 because in the collisions array wherever there is 1025 it resembles a boundary
    if (symbol === 1025) {
      battleZones.push(
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

const playerDownImage = new Image();
playerDownImage.src = "./images/playerDown.png";

const playerUpImage = new Image();
playerUpImage.src = "./images/playerUp.png";

const playerLeftImage = new Image();
playerLeftImage.src = "./images/playerLeft.png";

const playerRightImage = new Image();
playerRightImage.src = "./images/playerRight.png";

const foregroundImage = new Image();
foregroundImage.src = "./images/foregroundObjects.png";

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

const playerSprite = new Sprite({
  position: {
    x: canvas.width / 2 - 192 / 4 / 2, // start rendering the image in canvas from middle of the canvas screen
    y: canvas.height / 2 - 68 / 2,
  },
  image: playerDownImage,
  frames: {
    max: 4,
  },
  sprites: {
    up: playerUpImage,
    down: playerDownImage,
    left: playerLeftImage,
    right: playerRightImage,
  },
});

const backgroundSprite = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: pelletTownImageSource,
});

const foregroundSprite = new Sprite({
  position: {
    x: offset.x,
    y: offset.y,
  },
  image: foregroundImage,
});

// const testBoundary = new Boundary({
//   x: 400,
//   y: 400,
// });

// const movablesList = [backgroundSprite, testBoundary];
const movablesList = [
  backgroundSprite,
  ...boundaries,
  foregroundSprite,
  ...battleZones,
];

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

// function rectangularCollision({ player, boundary }) {
//   return (
//     player.position.x + player.width >= boundary.position.x &&
//     player.position.x <= boundary.position.x + boundary.width &&
//     player.position.y <= boundary.position.y + boundary.height &&
//     player.position.y + player.height >= boundary.position.y
//   )
// }

const battle = {
  initiated: false,
};
function animate() {
  requestAnimationFrame(animate);

  backgroundSprite.draw();

  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  // testBoundary.draw();

  battleZones.forEach((battleZone) => {
    battleZone.draw();
  });
  playerSprite.draw();
  playerSprite.moving = false;
  foregroundSprite.draw();

  if (battle.initiated) {
    console.debug("BATTLE IS INITIATED");
    return;
  }

  if (
    keys.upNavigation.pressed ||
    keys.downNavigation.pressed ||
    keys.leftNavigation.pressed ||
    keys.rightNavigation.pressed
  ) {
    for (let i = 0; i < battleZones.length; i++) {
      const battleZone = battleZones[i];
      const leftSideOfPlayer = playerSprite.position.x;
      const rightSideOfPlayer = leftSideOfPlayer + playerSprite.width;
      const leftSideOfBattleTile = battleZone.position.x;
      const rightSideOfBattleTile = leftSideOfBattleTile + battleZone.width;

      const interSectingAreaWidth =
        Math.min(rightSideOfPlayer, rightSideOfBattleTile) -
        Math.max(leftSideOfPlayer, leftSideOfBattleTile);

      const playerTop = playerSprite.position.y;
      const playerBottom = playerSprite.position.y + playerSprite.height;
      const battleZoneTop = battleZone.position.y;
      const battleZoneBottom = battleZone.position.y + battleZone.height;

      const interSectingAreaHeight =
        Math.min(playerBottom, battleZoneBottom) -
        Math.max(playerTop, battleZoneTop);

      const overlappingArea = interSectingAreaWidth * interSectingAreaHeight;

      const playerArea = playerSprite.width * playerSprite.height;
      const fractionOfBattleActivation = 0.03;
      const moreThanHalfOfPlayerIsInBattleZone =
        overlappingArea > playerArea / 2;
      const colliding = detectRectangularCollisions({
        player: playerSprite,
        boundary: battleZone,
      });
      const initiateBattle =
        colliding &&
        moreThanHalfOfPlayerIsInBattleZone &&
        Math.random() < fractionOfBattleActivation;

      if (initiateBattle) {
        console.debug("INITIATING BATTLE");
        battle.initiated = true;
        break;
      }
    }
  }
  if (
    keys.upNavigation.pressed &&
    (lastKeyPressed === `w` || lastKeyPressed === `ArrowUp`)
  ) {
    playerSprite.moving = true;
    playerSprite.image = playerSprite.sprites.up;
    const getDisplacement =
      (byUnits = { slow: 5, fast: 10 }) =>
      (movable) => {
        const displacement = (movable.position.y += byUnits.slow);
        return displacement;
      };
    navigate({
      boundaries,
      movablesList,
      playerSprite,
      direction: "up",
      getDisplacement,
      battleInitiated: battle.initiated,
    });
  } else if (
    keys.downNavigation.pressed &&
    (lastKeyPressed === `s` || lastKeyPressed === `ArrowDown`)
  ) {
    playerSprite.moving = true;
    playerSprite.image = playerSprite.sprites.down;
    const getDisplacement =
      (byUnits = { slow: 5, fast: 10 }) =>
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
      playerSprite,
      direction: "down",
      getDisplacement,
      battleInitiated: battle.initiated,
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
    playerSprite.moving = true;
    playerSprite.image = playerSprite.sprites.left;
    const getDisplacement =
      (byUnits = { slow: 5, fast: 10 }) =>
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
      playerSprite,
      direction: "left",
      getDisplacement,
      battleInitiated: battle.initiated,
    });
  } else if (
    keys.rightNavigation.pressed &&
    (lastKeyPressed === `d` || lastKeyPressed === `ArrowRight`)
  ) {
    playerSprite.moving = true;
    playerSprite.image = playerSprite.sprites.right;
    const getDisplacement =
      (byUnits = { slow: 5, fast: 10 }) =>
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
      playerSprite,
      direction: "right",
      getDisplacement,
      battleInitiated: battle.initiated,
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

    // case `Shift`:
    //   shouldIncreaseSpeed = true;
    //   break;
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

    // case `Shift`:
    //   shouldIncreaseSpeed = false;
    //   break;
    default:
      console.log(`no function associated with the key `, event.key);
  }
});

function navigate({
  boundaries,
  movablesList,
  playerSprite,
  direction,
  getDisplacement,
  byUnits,
  battleInitiated,
}) {
  if (battleInitiated) {
    return;
  }
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
      if (detectRectangularCollisions(params)) {
        console.log("colliding");
        playerColliding = true;
        break;
      }
    }
  }
  if (!playerColliding) {
    movablesList.forEach(getDisplacement(byUnits));
    // backgroundSprite.position.y += 10;
  }
}
