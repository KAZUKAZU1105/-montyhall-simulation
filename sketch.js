let doors = [];
let numDoors = 3;
let correctDoor;
let playerChoice = null;
let hostOpens = null;
let stage = 'select';

let wins = 0;
let trials = 0;

let resultP, statsP;
let door1Button,door2Button,door3Button;
let switchButton, stayButton;
let autoSwitchBtn, autoStayBtn;
let resetBtn;
let autoTrialRunning = false;

function setup() {
  createCanvas(600, 400);
  textSize(16);

  resultP = createP('');
  resultP.position(10, height + 10);

  statsP = createP('');
  statsP.position(10, height + 80);

  
  door1Button = createButton('ドア1');
  door1Button.mousePressed(() => handleDoorChoice(0));

  door2Button = createButton('ドア2');
  door2Button.mousePressed(() => handleDoorChoice(1));

  door3Button = createButton('ドア3');
  door3Button.mousePressed(() => handleDoorChoice(2));
  
  // 自動試行ボタンの追加
  autoSwitchBtn = createButton('ドアを変える戦略で100回試行');
  autoSwitchBtn.position(80, height + 200);
  autoSwitchBtn.mousePressed(() => runAutoTrials(true));

  autoStayBtn = createButton('ドアを変えない戦略で100回試行');
  autoStayBtn.position(350, height + 200);
  autoStayBtn.mousePressed(() => runAutoTrials(false));

  // リセットボタンの追加
  resetBtn = createButton('結果をリセット');
  resetBtn.position(250, height + 130);
  resetBtn.mousePressed(resetStats);

  initGame();
}

function initGame() {
  doors = [];
  playerChoice = null;
  hostOpens = null;
  correctDoor = floor(random(numDoors));
  stage = 'select';

  for (let i = 0; i < numDoors; i++) {
    doors.push({ x: 100 + i * 130, y: 100, w: 100, h: 150 });
  }

  resultP.html('ドアを1つ選んでください。');
  updateStats();

  if (switchButton) switchButton.remove();
  if (stayButton) stayButton.remove();
}

function draw() {
  background(240);
  text("（緑色はあなたが選択したドア）",150,50);
  text("（赤色は司会者が開いたはずれのドア）",400,50)
  for (let i = 0; i < doors.length; i++) {
    let d = doors[i];

    if (i === playerChoice) {
      fill(200, 255, 200); // プレイヤー選択
    } else if (i === hostOpens) {
      fill(255, 200, 200); // モンティが開けた
    } else {
      fill(255);
    }

    rect(d.x, d.y, d.w, d.h);
    fill(0);
    textAlign(CENTER, CENTER);
    text('ドア ' + (i + 1), d.x + d.w / 2, d.y + d.h + 15);

    if (stage === 'result') {
      if (i === correctDoor) {
        text('当たり！', d.x + d.w / 2, d.y + d.h / 2);
      } else {
        text('はずれ😢', d.x + d.w / 2, d.y + d.h / 2);
      }
    }
  }
}

function mousePressed() {
  if (stage !== 'select') return;

  for (let i = 0; i < doors.length; i++) {
    let d = doors[i];
    if (
      mouseX > d.x &&
      mouseX < d.x + d.w &&
      mouseY > d.y &&
      mouseY < d.y + d.h
    ) {
      playerChoice = i;

      let candidates = [];
      for (let j = 0; j < numDoors; j++) {
        if (j !== playerChoice && j !== correctDoor) {
          candidates.push(j);
        }
      }
      hostOpens = random(candidates);
      stage = 'host';

      resultP.html(`司会者がドア${hostOpens + 1}（はずれ）を開けました<br>ドアを変えますか？`);

      switchButton = createButton('ドアを変える');
      switchButton.position(150, height - 100);
      switchButton.mousePressed(() => {
        for (let i = 0; i < numDoors; i++) {
          if (i !== playerChoice && i !== hostOpens) {
            playerChoice = i;
            break;
          }
        }
        showResult();
      });

      stayButton = createButton('そのままにする');
      stayButton.position(300, height - 100);
      stayButton.mousePressed(() => {
        showResult();
      });
    }
  }
}

function showResult() {
  stage = 'result';
  trials++;

  if (playerChoice === correctDoor) {
    wins++;
    resultP.html(` 当たり！おめでとう！`);
  } else {
    resultP.html(`ハズレ😢`);
  }

  updateStats();

  if (switchButton) switchButton.remove();
  if (stayButton) stayButton.remove();

  setTimeout(() => {
    initGame();
    redraw();
  }, 3000);
}



function updateStats() {
  let winRate = trials > 0 ? (wins / trials) * 100 : 0;
  statsP.html(
    `<table border="1" cellpadding="4" style="border-collapse: collapse; background: #fff;">` +
    `<tr><th>試行回数</th><th>当たり回数</th><th>勝率</th></tr>` +
    `<tr><td>${trials}</td><td>${wins}</td><td>${winRate.toFixed(2)}%</td></tr>` +
    `</table>`
  );
}

function runAutoTrials(shouldSwitch) {
  if (autoTrialRunning) return;
  autoTrialRunning = true;

  let autoWins = 0;
  let autoTrials = 100;

  for (let t = 0; t < autoTrials; t++) {
    let correct = floor(random(numDoors));
    let choice = floor(random(numDoors));

    let candidates = [];
    for (let j = 0; j < numDoors; j++) {
      if (j !== choice && j !== correct) {
        candidates.push(j);
      }
    }
    let host = random(candidates);

    if (shouldSwitch) {
      for (let j = 0; j < numDoors; j++) {
        if (j !== choice && j !== host) {
          choice = j;
          break;
        }
      }
    }

    if (choice === correct) {
      autoWins++;
    }
  }

  wins += autoWins;
  trials += autoTrials;
  updateStats();

  resultP.html(
    `${shouldSwitch ? 'ドアを変える' : '変えない'}戦略の結果：<br>` +
    `当たり ${autoWins} 回 / ${autoTrials} 回`
  );

  autoTrialRunning = false;
}

function resetStats() {
  wins = 0;
  trials = 0;
  updateStats();
  resultP.html('結果をリセットしました。ドアを1つ選んでください。');
  initGame();
}



function handleDoorChoice(i) {
  if (stage !== 'select') return;

  playerChoice = i;

  // モンティが開けるドアの候補
  let candidates = [];
  for (let j = 0; j < numDoors; j++) {
    if (j !== playerChoice && j !== correctDoor) {
      candidates.push(j);
    }
  }
  hostOpens = random(candidates);
  stage = 'host';

  resultP.html(`司会者がドア${hostOpens + 1}（はずれ）を開けました<br>ドアを変えますか？`);

  switchButton = createButton('ドアを変える');
  switchButton.position(150, height - 100);
  switchButton.mousePressed(() => {
    for (let i = 0; i < numDoors; i++) {
      if (i !== playerChoice && i !== hostOpens) {
        playerChoice = i;
        break;
      }
    }
    showResult();
  });

  stayButton = createButton('そのままにする');
  stayButton.position(300, height - 100);
  stayButton.mousePressed(() => {
    showResult();
  });
}
