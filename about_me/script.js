let text = [
  `Cloud lint marble static fork neon drift. [normal]`,
  `Quantum echo velvet prism solar pulse. [happy]`,
  `Nebula cascade twilight ember flux. [thinking]`,
];
const emotionMap = {
  "[dissatisfied]": "dissatisfied.webp",
  "[happy]": "happy.webp",
  "[horror]": "horror.webp",
  "[mentallyabsent]": "mentally_absent.webp",
  "[normal]": "normal.webp",
  "[paranoid]": "paranoid.webp",
  "[sad]": "sad.webp",
  "[selfassured]": "self_assured.webp",
  "[smug]": "smug.webp",
  "[thinking]": "thinking.webp",
  "[tired]": "tired.webp",
};

const dialogueText = document.querySelector(".dialogue-text");
const dialogueBox = document.querySelector(".dialogue-box");
const characterImg = document.querySelector(".character");

let index = 0;
let isTyping = false;

typewriterEffect(text[index]);

dialogueBox.addEventListener("click", function () {
  //Event listener for clicking the dialogue box to change the text and image

  if (isTyping) return;

  if (index + 1 < text.length) {
    index++;
    typewriterEffect(text[index]);
  } else {
    options();
  }
});

function changeImage(text) {
  //Function for changing the character image based on the dialogue
  // Find matching emotion tag in text
  for (const [tag, filename] of Object.entries(emotionMap)) {
    if (text.includes(tag)) {
      characterImg.src = `../assets/about_me/${filename}`;
      return;
    }
  }
  characterImg.src = "../assets/about_me/normal.webp";
}

function typewriterEffect(fullText) {
  // Function for adding the text gradually
  isTyping = true;

  changeImage(fullText);

  const cleanText = fullText.replace(/\[.*?\]/, "");

  dialogueText.textContent = "";

  let charIndex = 0;
  const typingSpeed = 20;

  function typeNextChar() {
    if (charIndex < cleanText.length) {
      dialogueText.textContent += cleanText.charAt(charIndex);
      charIndex++;
      setTimeout(typeNextChar, typingSpeed);
    } else {
      isTyping = false;
    }
  }
  typeNextChar();
}

function options() {
  // Function to show options after dialogue ends
  characterImg.src = "../assets/about_me/normal.webp";
  typewriterEffect("What would you like to talk about next?");

  document.querySelector(".options").innerHTML = `
    <div class="option")">
      <img src="../assets/about_me/option_box.png" alt="Option box">
      <span class="option-text">Tell me about your projects</span>
    </div>
    <div class="option")">
      <img src="../assets/about_me/option_box.png" alt="Option box">
      <span class="option-text">What are your hobbies?</span>
    </div>
    <div class="option"">
      <img src="../assets/about_me/option_box.png" alt="Option box">
      <span class="option-text">Share your experience</span>
    </div>
    <div class="option")">
      <img src="../assets/about_me/option_box.png" alt="Option box">
      <span class="option-text">What's your background?</span>
    </div>
  `;
}
