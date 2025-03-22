function animate() {
  if (!window.backgroundSprite) {
  }
  requestAnimationFrame(animate);

  backgroundSprite.draw();

  boundaries.forEach((boundary) => {
    boundary.draw();
  });
  // testBoundary.draw();
  playerSprite.draw();
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
