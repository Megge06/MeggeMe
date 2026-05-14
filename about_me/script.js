let text = [
  `Hey! Who are you? [normal]`,
  `I'm happy you found my website. Isn't it cool? On this site you can ask me some questions to get to know me. [happy]`,
  `Stick around for a bit and take a look around. I don't really know how this IndieWeb stuff works but link me on your page or something! [selfassured]`,
];

const dialogues = {
  test1: [
    `Oh you wanna know about me? I'm honored. [happy]`,
    `I am 19 years old and live in Germany. My name is Maxim but online and also sometimes irl people call me Megge. [normal]`,
    `Currently I am studying computer science in a cooperative study program with a company. I won't tell you which company though, but maybe you can guess it. I challenge you! [smug]`,
    `I think my hobbies are quite clear from this website design. I like video games, programming and all sorts of other nerdy stuff. [selfassured]`,
    `If I had to give you some media that I like to give you an image of myself: [thinking]`,
    `Games: Persona, Hearts of Iron, Red Dead Redemption 2, Minecraft [normal]`,
    `Anime: JoJo's, Chainsaw Man, Attack On Titan, Saiki K, Bocchi, Mushoku Tensei [happy]`,
    `And a lot of other stuff. You can just ask me about anything if you want to know more. [normal]`,
  ],
  test2: [
    `Oho you wanna know about this website? [smug]`,
    `If you want to know technical stuff you can always look at my GitHub, it's open source. [normal]`,
    `But this is the first website I've ever made so expect some jankiness. But I am quite happy with how it looks. [happy]`,
    `The pages are inspired by "Persona", "Milk outside a bag of milk outside a bag of milk", "Needy Streamer Overload", the Wii Menu,, Minecraft and other stuff that I haven't added yet so we'll see what happens. [thinking]`,
    `I apologize to anyone using this site on the phone, it's not the best experience. But hey, it works and that's more than a lot of other IndieWeb sites can say. [selfassured]`,
    `The static sites are really just vanilla HTML, CSS and JS. No fancy frameworks here. But it's my first website so what did you expect. The only non vanilla stuff I used was Eleventy for my Blog and Photos page. [normal]`,
    `If you have any suggestions or want to help me improve the site, feel free to reach out! [happy]`,
    `As this is such a simple website though, I do not have much more to say about it. [dissatisfied]`,
    `You can just take a look around and see for yourself! [smug]`,
  ],
  test3: [
    `Right now hmmm. I'm afraid I won't update this section often enough, but here is what I am doing right NOW. [thinking]`,
    `I just started studying and working so a lot of my time is going into that. A lot of new experiences and sometimes it's exhausting. [tired]`,
    `But I am still keeping up on my hobbies. I am currently playing the Phoenix Wright Trilogy, Hearts of Iron IV and Persona 3 Reload. I also still dabble with my GameCube and PSP. [happy]`,
    `In terms of anime, I am currently rewatching a bunch of stuff, whatever I want at the moment. [normal]`,
    `I am still watching the seasonal shows of course but I am also trying to catch up with Re:Zero and finish watching SNAFU. [normal]`,
    `Of course I am currently programming this website and that is really my only private project right now. I don't want to start anything new before I finish this. I just got a Raspberry Pi to self host my website, but I have no experience with that yet. [thinking]`,
    `And that's pretty much what I'm doing right now. Of course I also spend time with friends and family and such, but that is not something relevant. [selfassured]`,
  ],
  test4: [
    `Recommendations hmmmmmmmmmmmmmmmmmmmmmmmm. [thinking]`,
    `There's too much stuff I want to recommend and I can't decide. When in doubt you can look at my Steam or MyAnimeList Account. But I'll still try to put some stuff here that I recommend. [normal]`,
    `I'll try to focus on more "unknown" (all of it is still popular media but still) stuff I think more people should know about. [thinking]`,
    `Something I always wanna recommend is stuff I'm watching on YouTube. I can wholeheartedly recommend NeverKnowsBest and Moon Channel (Not "Moon", it's "Moon Channel". "Moon" is a bad YouTuber). [happy]`,
    `For Games of course any that I already mentioned in my About Me like Persona (any game in the series), but also Phoenix Wright, Hearts of Iron IV, Outer Wilds, and many others which I may add to this list. [normal]`,
    `For more "unknown" anime I can recommend Monogatari, Daily lives of High School Boys, Saiki k, A Place Further than The Universe, Bocchi, Look Back and Grand Blue. [happy]`,
    `These recommendations already feel fake and mainstream, not good. Take a look at my accounts as I said, you can get a bigger picture there. [paranoid]`,
    `The things I mentioned are still good though! [mentallyabsent]`,
  ],
};

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

function handleDialogueClick() {
  if (isTyping) return;

  if (index + 1 < text.length) {
    index++;
    typewriterEffect(text[index]);
  } else {
    options();
  }
}

dialogueBox.addEventListener("click", handleDialogueClick);
dialogueText.addEventListener("click", handleDialogueClick);

function changeImage(text) {
  for (const [tag, filename] of Object.entries(emotionMap)) {
    if (text.includes(tag)) {
      characterImg.src = `../assets/about_me/${filename}`;
      return;
    }
  }
  characterImg.src = "../assets/about_me/normal.webp";
}

function typewriterEffect(fullText) {
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
  characterImg.src = "../assets/about_me/normal.webp";
  typewriterEffect("What would you like to talk about?");

  const optionsContainer = document.querySelector(".options");
  optionsContainer.style.display = "flex";

  optionsContainer.innerHTML = `
    <div class="option test1" role="button" tabindex="0">
      <img src="../assets/about_me/option_box_gray.png" alt="">
      <span style="color: #6a4656;" class="option-text">Who are you?</span>
    </div>
    <div class="option test2" role="button" tabindex="0">
      <img src="../assets/about_me/option_box_gray.png" alt="">
      <span style="color: #6a4656;" class="option-text">Tell me about this site!</span>
    </div>
    <div class="option test3" role="button" tabindex="0">
      <img src="../assets/about_me/option_box_gray.png" alt="">
      <span style="color: #6a4656;" class="option-text">What are you doing right now?</span>
    </div>
    <div class="option test4" role="button" tabindex="0">
      <img src="../assets/about_me/option_box_gray.png" alt="">
      <span style="color: #6a4656;" class="option-text">Give me some recommendations!</span>
    </div>
  `;

  // Add hover and click event listeners to all options
  const optionElements = document.querySelectorAll(".option");
  optionElements.forEach((option) => {
    const optionImg = option.querySelector("img");
    const optionText = option.querySelector(".option-text");
    const optionClass2 = option.getAttribute("class").split(" ")[1];
    const originalImgSrc = optionImg.src;
    const originalTextColor = optionText.style.color;

    option.addEventListener("mouseenter", () => {
      optionImg.src = "../assets/about_me/option_box.png";
      optionText.style.color = "#ac3232";
    });

    option.addEventListener("mouseleave", () => {
      optionImg.src = originalImgSrc;
      optionText.style.color = originalTextColor;
    });

    option.addEventListener("click", () => {
      if (isTyping) return;
      text = dialogues[optionClass2];
      index = 0;

      optionsContainer.style.display = "none";
      optionsContainer.innerHTML = "";
      typewriterEffect(text[index]);
    });

    option.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        option.click();
      }
    });
  });
}
