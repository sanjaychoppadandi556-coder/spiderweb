* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  height: 100vh;
  background: #000;
  overflow: hidden;
}

.scene {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.web {
  position: absolute;
  top: 0;
  left: 140px;
  width: 2px;
  height: 260px;
  background: white;
  transform-origin: top center;
  animation: webSwing 4s ease-in-out infinite;
}

.spiderman {
  position: absolute;
  width: 260px;
  left: 30px;
  top: 230px;
  transform-origin: 130px -230px;
  animation: swing 4s ease-in-out infinite;
  filter: drop-shadow(0 0 18px rgba(255, 255, 255, 0.35));
}

@keyframes swing {
  0% {
    transform: rotate(-28deg) translateX(-40px);
  }

  50% {
    transform: rotate(28deg) translateX(90px);
  }

  100% {
    transform: rotate(-28deg) translateX(-40px);
  }
}

@keyframes webSwing {
  0% {
    transform: rotate(-18deg);
  }

  50% {
    transform: rotate(18deg);
  }

  100% {
    transform: rotate(-18deg);
  }
}

@media (max-width: 600px) {
  .spiderman {
    width: 190px;
    left: 20px;
    top: 220px;
  }

  .web {
    left: 110px;
    height: 240px;
  }
}
