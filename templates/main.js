// document.addEventListener('DOMContentLoaded', function() {
//     const qrCode = document.querySelector('.qr-code img');
//     setInterval(() => {
//         qrCode.classList.toggle('scanning');
//     }, 1000);
// });

var canvas = document.getElementById('wheel');
var heightRatio = 2;
canvas.height = canvas.width * heightRatio;
canvas.width=heightRatio*canvas.width;

const sectors = [
    { color: "#eeefd0", text: "red", label: "SMART WATCH" },
    { color: "red", text: "white", label: "BUY WORTH RS.500/- AND GET 1 TSHIRT" },
    { color: "#eeefd0", text: "red", label: "OVEN" },
    { color: "red", text: "white", label: "WASHING MACHINE" },
    { color: "#eeefd0", text: "red", label: "IPHONE 15 PRO MAX" },
    { color: "red", text: "white", label: "PS 5" },
    { color: "#eeefd0", text: "red", label: "BETTER LUCK NEXT TIME" },
    { color: "red", text: "white", label: "SPEND RS.225/- & GET A SWEATSHIRT WORTH RS.899/-" },
    { color: "#eeefd0", text: "red", label: "GET A FREE T-SHIRT" },
    { color: "red", text: "white", label: "GIFT VOUCHER WORTH RS.600/-" },
    { color: "#eeefd0", text: "red", label: "60% OFF YOUR BILL (MIN 3000/-)" },
    { color: "red", text: "white", label: "AIR PODS" },
];

const events = {
    listeners: {},
    addListener: function (eventName, fn) {
      this.listeners[eventName] = this.listeners[eventName] || [];
      this.listeners[eventName].push(fn);
    },
    fire: function (eventName, ...args) {
      if (this.listeners[eventName]) {
        for (let fn of this.listeners[eventName]) {
          fn(...args);
        }
      }
    },
};

const rand = (m, M) => Math.random() * (M - m) + m;
const tot = sectors.length;
const spinEl = document.querySelector("#spin");
const ctx = document.querySelector("#wheel").getContext("2d");
const dia = ctx.canvas.width;
const rad = dia / 2;
const PI = Math.PI;
const TAU = 2 * PI;
const arc = TAU / sectors.length;

const friction = 0.991;
let angVel = 0;
let ang = 0;
let spinButtonClicked = false;

const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;

function drawSector(sector, i) {
    const ang = arc * i;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, ang, ang + arc);
    ctx.lineTo(rad, rad);
    ctx.fill();

    ctx.translate(rad, rad);
    ctx.rotate(ang + arc /2);
    ctx.textAlign = "right";
    ctx.fillStyle = sector.text;
    ctx.font = " 20px 'Lato', sans-serif";
    ctx.fillText(sector.label,rad-10, 10, 260);

    ctx.restore();
}

function rotate() {
    const sector = sectors[getIndex()];
    ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
    spinEl.textContent ="SPIN" 
    spinEl.style.color = "#ddb458";
    spinEl.style.fontWeight = "bold";
    // spinEl.textContent = !angVel ? "SPIN" : sector.label;
    spinEl.style.background = sector.color;
    // spinEl.style.color = sector.text;
}

// function frame() {
//     if (!angVel && spinButtonClicked) {
//         const finalSector = sectors[getIndex()];
//         events.fire("spinEnd", finalSector);
//         spinButtonClicked = false;
//         return;
//     }

//     angVel *= friction;
//     if (angVel < 0.002) angVel = 0;
//     ang += angVel;
//     ang %= TAU;
//     rotate();
// }
function frame() {
  const currentSectorIndex = getIndex();

  // Define the indices of sectors to skip
  const sectorsToSkip = [2,3,4,5]; // "AIR PODS" and "SMART WATCH"

  // Check if the spinner is about to stop on a sector to skip
  if (!angVel && spinButtonClicked) {
      const finalSector = sectors[currentSectorIndex];
      if (sectorsToSkip.includes(currentSectorIndex)) {
          // Adjust the angle slightly to move to the next sector
          ang += arc / 2; // Adjust this value if needed
          ang %= TAU;
      } else {
        const hide_this = document.querySelector("#hide-this-div"); 
        hide_this.classList.add("fade-out-1");

        // Wait for the animation to finish before setting display: none
        hide_this.addEventListener("transitionend", function handleTransitionEnd() {
          hide_this.classList.add("hidden-1");
          hide_this.classList.remove("fade-out-1");
          hide_this.removeEventListener("transitionend", handleTransitionEnd);
        });
        
      
          events.fire("spinEnd", finalSector);
          spinButtonClicked = false;
          return;
        

         
      }
  }

  // Continue spinning with friction applied
  angVel *= friction;
  if (angVel < 0.002) angVel = 0;
  ang += angVel;
  ang %= TAU;
  rotate();
}

function engine() {
    frame();
    requestAnimationFrame(engine);
}

function init() {
  sectors.forEach(drawSector);
  rotate();
  engine();

  spinEl.addEventListener("click", () => {
      if (!angVel) {
          const biasChance = Math.random();

          // Adjust the angle to bias towards "Better Luck Next Time"
          if (biasChance < 1) { // 70% chance to land on "Better Luck Next Time"
              const betterLuckIndex = sectors.findIndex(sector => sector.label === "BETTER LUCK NEXT TIME");
              angVel = rand(0.25, 0.45);
              // Calculate the target angle for "Better Luck Next Time"
              ang = betterLuckIndex * arc + rand(-arc / 4, arc / 4);
          } else {
              angVel = rand(0.25, 0.45); // Random spin without bias
          }
      }

      spinButtonClicked = true;
      spinEl.style.pointerEvents = "none";
      spinEl.style.opacity = "0.5";

      // Save the spin state in local storage
      localStorage.setItem("wheelSpun", "true");
  });
}


init();

// window.onload = function() {
//     if (localStorage.getItem("wheelSpun") === "true") {
//         alert("You have already spun the wheel. Refreshing the page is disabled.");
//         spinEl.style.pointerEvents = "none";
//         spinEl.style.opacity = "0.5";

//         // Disable page refresh
//         window.onbeforeunload = function() {
//             return "You cannot refresh the page after spinning the wheel.";
//         };
//     }
// };

events.addListener("spinEnd", (sector) => {
    console.log(`Woop! You won ${sector.label}`);
    const resultEl = document.querySelector("#result");
    resultEl.style.color = "gold";
    resultEl.style.fontSize = "60px";
    if (sector.label === "BETTER LUCK NEXT TIME") {
      resultEl.textContent = "BETTER LUCK NEXT TIME!";
  } else {
      resultEl.textContent = `CONGRATULATIONS! YOU WON ${sector.label}!`;
  }
    function onSpinEnd(gift) {
      // Redirect to the Flask route with the gift value as a URL parameter
      setTimeout(function () {
        window.location.href = `/set-gift?gift=${encodeURIComponent(gift)}`
      }, 5000)
     
  }
  onSpinEnd(sector.label)
  
});
events.addListener("spinEnd", (sector) => {
  console.log(`Woop! You won ${sector.label}`);
  localStorage.setItem("prize", sector.label);
  // Redirect to another page
  setTimeout(function () {
    window.location.href = "/thankyou"; 
  }, 5000)
  
});
