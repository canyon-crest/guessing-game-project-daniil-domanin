function time(){
    let d = new Date();
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    let day = d.getDate();
    let suffix = day >= 11 && day <= 13 ? "th" : 
                 day % 10 === 1 ? "st" : day % 10 === 2 ? "nd" : 
                 day % 10 === 3 ? "rd" : "th";
    let hours = d.getHours();
    let minutes = d.getMinutes().toString().padStart(2, '0');
    let seconds = d.getSeconds().toString().padStart(2, '0');
    return months[d.getMonth()] + " " + day + suffix + ", " + d.getFullYear() + 
           " - " + hours + ":" + minutes + ":" + seconds;
}
date.textContent = time();
setInterval(() => { date.textContent = time(); }, 1000);

let score, answer, level, playerName;
const levelArr = document.getElementsByName("level");
const scoreArr = [];
let gameStartTime, totalGameTime = 0, fastestTime = null;
const timeArr = [];
let currentStreak = 0;
let minRange = 1, maxRange = 100;
let hintUsed = false;
let achievementsUnlocked = [];
let challengeMode = false, challengeAnswer, challengeMaxGuesses;

submitName.addEventListener("click", function() {
    let name = document.getElementById('playerName').value.trim();
    if (name === "") { alert("Please enter your name!"); return; }
    playerName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    document.getElementById('nameInput').style.display = 'none';
    document.getElementById('gameArea').style.display = 'block';
    msg.textContent = "Welcome " + playerName + "! Select a Level";
});

const themes = {
    light: { bg: '#ffffff', text: '#000000' },
    dark: { bg: '#1a1a1a', text: '#000000' }
};
themeSelect.addEventListener("change", function() {
    document.body.style.backgroundColor = themes[this.value].bg;
    document.body.style.color = themes[this.value].text;
});

playBtn.addEventListener("click", play);
guessBtn.addEventListener("click", makeGuess);
giveUpBtn.addEventListener("click", giveUp);

hintBtn.addEventListener("click", function() {
    if (hintUsed) { hintText.textContent = "Already used!"; return; }
    score += 2;
    hintUsed = true;
    hintText.textContent = "Hint: The answer is " + (answer % 2 === 0 ? "EVEN" : "ODD") + " (+2 to score)";
    hintBtn.disabled = true;
});

challengeBtn.addEventListener("click", () => document.getElementById('challengeSetup').style.display = 'block');
startChallengeBtn.addEventListener("click", function() {
    challengeAnswer = parseInt(customNumber.value);
    challengeMaxGuesses = parseInt(maxGuesses.value);
    if (isNaN(challengeAnswer) || isNaN(challengeMaxGuesses)) { alert("Enter valid numbers!"); return; }
    challengeMode = true;
    document.getElementById('challengeSetup').style.display = 'none';
    challengeStatus.textContent = "Player 2's turn!";
    play();
});

function play(){
    playBtn.disabled = true;
    guessBtn.disabled = false;
    giveUpBtn.disabled = false;
    guess.disabled = false;
    gameStartTime = Date.now();
    hintUsed = false;
    progressBar.style.display = 'block';
    hintSection.style.display = 'block';
    hintBtn.disabled = false;
    hintText.textContent = '';
    
    for(let i=0; i<levelArr.length; i++){
        levelArr[i].disabled = true;
        if(levelArr[i].checked){
            level = parseInt(levelArr[i].value);
        }
    }
    
    if (challengeMode) {
        answer = challengeAnswer;
        level = challengeMaxGuesses;
    } else {
        answer = Math.floor(Math.random()*level)+1;
    }
    
    minRange = 1;
    maxRange = level;
    rangeText.textContent = "Range: 1-" + level;
    
    msg.textContent = playerName + ", guess a number 1-" + level;
    score = 0;
}

function makeGuess(){
    let userGuess = parseInt(guess.value);
    if (isNaN(userGuess) || userGuess < 1 || userGuess > level){
        msg.textContent = "INVALID, guess a number!";
        return;
    }
    score++;
    
    let diff = Math.abs(userGuess - answer);
    let temp = "";
    
    if(userGuess<answer){
        if (userGuess >= minRange) minRange = userGuess + 1;
        rangeText.textContent = "Range: " + minRange + "-" + maxRange;
        
        if (diff === 1) temp = " (very hot!)";
        else if (diff <= 3) temp = " (hot!)";
        else if (diff <= 5) temp = " (warm)";
        else temp = " (cold)";
        msg.textContent = "Too low, guess again" + temp;
    }
    else if(userGuess>answer){
        if (userGuess <= maxRange) maxRange = userGuess - 1;
        rangeText.textContent = "Range: " + minRange + "-" + maxRange;
        
        if (diff === 1) temp = " (very hot!)";
        else if (diff <= 3) temp = " (hot!)";
        else if (diff <= 5) temp = " (warm)";
        else temp = " (cold)";
        msg.textContent = "Too high, guess again" + temp;
    }
    else{
        let gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
        let rating = score / level <= 0.2 ? "Excellent!" : 
                     score / level <= 0.4 ? "Great!" : 
                     score / level <= 0.6 ? "Good!" : "Keep trying!";
        
        checkAchievements(score, gameTime);
        currentStreak++;
        
        msg.textContent = "Correct " + playerName + "! " + score + " tries in " + gameTime + " sec. " + rating;
        updateScore(gameTime);
        reset();
    }
    guess.value = "";
}

function giveUp() {
    score = parseInt(level);
    let gameTime = Math.floor((Date.now() - gameStartTime) / 1000);
    msg.textContent = playerName + ", you gave up! Answer was " + answer;
    currentStreak = 0;
    updateScore(gameTime);
    reset();
}

function checkAchievements(score, gameTime) {
    if (score === 1 && !achievementsUnlocked.includes("First Try")) {
        achievementsUnlocked.push("First Try");
    }
    if (gameTime <= 10 && !achievementsUnlocked.includes("Speed Demon")) {
        achievementsUnlocked.push("Speed Demon");
    }
    if (currentStreak >= 3 && !achievementsUnlocked.includes("3 Streak")) {
        achievementsUnlocked.push("3 Streak");
    }
    if (achievementsUnlocked.length > 0) {
        achievements.textContent = "Achievements: " + achievementsUnlocked.join(", ");
    }
}

function reset(){
    guessBtn.disabled = true;
    giveUpBtn.disabled = true;
    guess.value = "";
    guess.disabled = true;
    playBtn.disabled = false;
    progressBar.style.display = 'none';
    hintSection.style.display = 'none';
    
    for(let i=0; i< levelArr.length; i++){
        levelArr[i].disabled = false;
    }
    
    if (challengeMode) {
        challengeMode = false;
        challengeStatus.textContent = "Complete!";
    }
}

function updateScore(gameTime){
    scoreArr.push(score);
    timeArr.push(gameTime);
    totalGameTime += gameTime;
    
    streak.textContent = "Streak: " + currentStreak;
    
    if (fastestTime === null || gameTime < fastestTime) {
        fastestTime = gameTime;
    }
    
    wins.textContent = "Total wins: " + scoreArr.length;
    let sum = 0;
    scoreArr.sort((a, b) => a - b);
    
    const lb = document.getElementsByName("leaderboard");
    for(let i=0; i<scoreArr.length; i++){
        sum += scoreArr[i];
        if(i < lb.length){
            lb[i].textContent = scoreArr[i];
        }
    }
    
    let avg = sum/scoreArr.length;
    avgScore.textContent = "Average Score: " + avg.toFixed(2);
    fastestGame.textContent = "Fastest game: " + fastestTime + " sec";
    avgTime.textContent = "Average time: " + (totalGameTime / scoreArr.length).toFixed(1) + " sec";
}