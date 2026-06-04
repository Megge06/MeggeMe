function namesToLetters(){
  //Search for all names to split them into letters
  const nameElements = document.querySelectorAll('p.name');

  nameElements.forEach((nameEl, nameIndex) => {
    const fullName = nameEl.textContent;
    nameEl.textContent = '';
    
    const words = fullName.split(' ');
    
    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word-container';
      wordSpan.id = `name-${nameIndex}-word-${wordIndex}`;
      
      wordSpan.style.display = 'inline-block';
      wordSpan.style.whiteSpace = 'nowrap';
      
      const letters = word.split('');
      
      letters.forEach((letter, letterIndex) => {
        const letterSpan = document.createElement('span');
        letterSpan.textContent = letter;
        
        letterSpan.className = 'individual-letter';
        letterSpan.id = `name-${nameIndex}-word-${wordIndex}-letter-${letterIndex}`;
        
        const randomRotation = getRandom(-8, 8); 
        const randomSize = getRandom(0.95, 1.25);
        const randomYShift = getRandom(-4, 4);
        
        letterSpan.style.display = 'inline-block';
        letterSpan.style.transform = `rotate(${randomRotation}deg)`;
        letterSpan.style.fontSize = `${randomSize}rem`;
        letterSpan.style.translate = `0px ${randomYShift}px`;
        
        wordSpan.appendChild(letterSpan);
      });
      
      nameEl.appendChild(wordSpan);
      
      if (wordIndex < words.length - 1) {
        const spaceSpan = document.createElement('span');
        spaceSpan.innerHTML = '&nbsp;';
        spaceSpan.className = 'letter-space';
        spaceSpan.id = `name-${nameIndex}-space-${wordIndex}`;
        spaceSpan.style.display = 'inline-block';
        
        nameEl.appendChild(spaceSpan);
      }
      
    });
  });
}

function getRandom(min, max) {
    return Math.random() * (max - min) + min;
}

namesToLetters();