let words = JSON.parse(localStorage.getItem('words')) || [];
let weakWords = JSON.parse(localStorage.getItem('weakWords')) || [];
let programmingWords = JSON.parse(localStorage.getItem('programmingWords')) || [];
let currentIndex;
let currentList;
let isWeakWordsView = false;

document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners to handle Enter key
    document.getElementById('word-input').addEventListener('keypress', handleKeyPress);
    document.getElementById('translation-input').addEventListener('keypress', handleKeyPress);

    // Initialize with all words
    displayWords(words);
});

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addEntry();
        event.preventDefault(); // Prevent form submission or other default actions
    }
}

function addEntry() {
    const wordInput = document.getElementById('word-input');
    const translationInput = document.getElementById('translation-input');

    const word = wordInput.value.trim();
    const translation = translationInput.value.trim();

    if (word && translation) {
        // تحقق من وجود الكلمة في أي من القوائم الثلاثة
        const isDuplicateInWords = words.some(entry => entry.word.toLowerCase() === word.toLowerCase());
        const isDuplicateInWeakWords = weakWords.some(entry => entry.word.toLowerCase() === word.toLowerCase());
        const isDuplicateInProgrammingWords = programmingWords.some(entry => entry.word.toLowerCase() === word.toLowerCase());

        if (isDuplicateInWords || isDuplicateInWeakWords || isDuplicateInProgrammingWords) {
            alert('الكلمة موجودة بالفعل في إحدى القوائم.');
            return;
        }

        // إضافة المدخل الجديد إذا لم تكن الكلمة مكررة
        words.push({ word, translation, reviewed: false });
        localStorage.setItem('words', JSON.stringify(words));

        // مسح المدخلات
        wordInput.value = '';
        translationInput.value = '';
        displayWords(words);
    }
}

function displayWords(wordsToDisplay) {
    currentList = wordsToDisplay;
    isWeakWordsView = wordsToDisplay === weakWords;
    const outputList = document.getElementById('output-list');
    outputList.innerHTML = '';
    // تم تعليق الكود التالي لعدم الترتيب ابجديا
    // wordsToDisplay.sort((a, b) => {
    //     const wordA = a.word.toLowerCase();
    //     const wordB = b.word.toLowerCase();
    //     if (wordA < wordB) return -1;
    //     if (wordA > wordB) return 1;
    //     return 0;
    // });

    wordsToDisplay.forEach((entry, index) => {
        const listItem = document.createElement('li');

        const textDiv = document.createElement('div');
        textDiv.classList.add('text');
        textDiv.innerHTML = `<div class="translated"><b>${index + 1}. ${entry.translation}</b></div> 
                             <div class="word"><i>${entry.word}</i></div>`;
        if (!entry.reviewed) {
            textDiv.style.color = 'red';
        }
        textDiv.addEventListener('click', () => {
            entry.reviewed = true;
            localStorage.setItem('words', JSON.stringify(words));
            localStorage.setItem('weakWords', JSON.stringify(weakWords));
            localStorage.setItem('programmingWords', JSON.stringify(programmingWords));
            displayWords(currentList);
        });

        const playButton = document.createElement('button');
        playButton.textContent = '🔊';
        playButton.classList.add('play-button');
        playButton.addEventListener('click', (event) => {
            event.stopPropagation();
            speak(entry.word);
        });

        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('options');
        const optionsButton = document.createElement('button');
        optionsButton.classList.add('options-button');
        optionsButton.textContent = '⚙️';
        optionsButton.onclick = () => openModal(index);
        optionsDiv.appendChild(optionsButton);

        listItem.appendChild(textDiv);
        listItem.appendChild(playButton);
        listItem.appendChild(optionsDiv);
        outputList.appendChild(listItem);
    });
}

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
}
function openModal(index) {
    currentIndex = index;
    const modal = document.getElementById('modal');
    const editWordInput = document.getElementById('edit-word-input');
    const editTranslationInput = document.getElementById('edit-translation-input');

    const entry = currentList[currentIndex];
    editWordInput.value = entry.word;
    editTranslationInput.value = entry.translation;

    const markAsWeakButton = document.getElementById('mark-as-weak-button');
    const moveToAllWordsButton = document.getElementById('move-to-all-words-button');
    const markAsProgrammingButton = document.getElementById('mark-as-programming-button');

    // Show/Hide buttons based on current view
    if (currentList === words) {
        markAsWeakButton.style.display = 'block';
        moveToAllWordsButton.style.display = 'none';
        markAsProgrammingButton.style.display = 'block'; // Show the Add to Programming button
    } else if (currentList === weakWords) {
        markAsWeakButton.style.display = 'none';
        moveToAllWordsButton.style.display = 'block';
        markAsProgrammingButton.style.display = 'block'; // Hide the Add to Programming button
    } else if (currentList === programmingWords) {
        markAsWeakButton.style.display = 'block';
        moveToAllWordsButton.style.display = 'block';
        markAsProgrammingButton.style.display = 'none'; // Hide the Add to Programming button
    }

    modal.style.display = 'block';
}



function markAsProgramming() {
    const entry = currentList[currentIndex];
    if (!programmingWords.includes(entry)) {
        programmingWords.push(entry);
        localStorage.setItem('programmingWords', JSON.stringify(programmingWords));
    }
    currentList.splice(currentIndex, 1);
    localStorage.setItem('words', JSON.stringify(words));
    closeModal();
    displayWords(currentList);
}

function moveToAllWords() {
    const entry = currentList[currentIndex];
    if (!words.includes(entry)) {
        words.push(entry);
        localStorage.setItem('words', JSON.stringify(words));
    }
    currentList.splice(currentIndex, 1);
    localStorage.setItem('weakWords', JSON.stringify(weakWords));
    closeModal();
    displayWords(currentList);
}

function markAsWeak() {
    const entry = currentList[currentIndex];
    if (!weakWords.includes(entry)) {
        weakWords.push(entry);
        localStorage.setItem('weakWords', JSON.stringify(weakWords));
    }
    currentList.splice(currentIndex, 1);
    localStorage.setItem('words', JSON.stringify(words));
    closeModal();
    displayWords(currentList);
}



function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function saveEdit() {
    const editWordInput = document.getElementById('edit-word-input');
    const editTranslationInput = document.getElementById('edit-translation-input');

    currentList[currentIndex].word = editWordInput.value;
    currentList[currentIndex].translation = editTranslationInput.value;

    localStorage.setItem('words', JSON.stringify(words));
    localStorage.setItem('weakWords', JSON.stringify(weakWords));
    localStorage.setItem('programmingWords', JSON.stringify(programmingWords));
    closeModal();
    displayWords(currentList);
}

function confirmDelete() {
    if (confirm('♻️هل أنت متأكد أنك تريد حذف هذا المدخل؟')) {
        currentList.splice(currentIndex, 1);
        if (isWeakWordsView) {
            localStorage.setItem('weakWords', JSON.stringify(weakWords));
        } else {
            localStorage.setItem('words', JSON.stringify(words));
        }
        localStorage.setItem('programmingWords', JSON.stringify(programmingWords));
        closeModal();
        displayWords(currentList);
    }
}

function markAsWeak() {
    const entry = currentList[currentIndex];
    if (!weakWords.includes(entry)) {
        weakWords.push(entry);
        localStorage.setItem('weakWords', JSON.stringify(weakWords));
    }
    currentList.splice(currentIndex, 1);
    localStorage.setItem('words', JSON.stringify(words));
    closeModal();
    displayWords(currentList);
}

function markAsProgramming() {
    const entry = currentList[currentIndex];
    if (!programmingWords.includes(entry)) {
        programmingWords.push(entry);
        localStorage.setItem('programmingWords', JSON.stringify(programmingWords));
    }
    currentList.splice(currentIndex, 1);
    localStorage.setItem('words', JSON.stringify(words));
    closeModal();
    displayWords(currentList);
}

function moveToAllWords() {
    const entry = currentList[currentIndex];
    if (!words.includes(entry)) {
        words.push(entry);
        localStorage.setItem('words', JSON.stringify(words));
    }
    currentList.splice(currentIndex, 1);
    localStorage.setItem('weakWords', JSON.stringify(weakWords));
    localStorage.setItem('programmingWords', JSON.stringify(programmingWords));
    closeModal();
    displayWords(currentList);
}

function showAllWords() {
    displayWords(words);
}

function showWeakWords() {
    displayWords(weakWords);
}

function showProgrammingWords() {
    displayWords(programmingWords);
}

// script.js
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

// تحديث الساعة كل ثانية
setInterval(updateClock, 1000);

// التحديث الأول عند تحميل الصفحة
updateClock();

