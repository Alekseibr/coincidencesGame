"use strict"
// loader
// дом построен можно обращаться к файлам
document.addEventListener("DOMContentLoaded", () => {

//убираем вызов контекстного меню во всей игре
document.documentElement.addEventListener('contextmenu', (e)=>{
    e.preventDefault();
});
    
let percents = document.querySelector('.percents'); // проценты
let mediaFiles = document.querySelectorAll('img, audio'); // все аудио и картинки
let btnStart = document.querySelector('.preloader .btn'); // кнопка старта
let i = 0;
let res = 0;

for(let file of mediaFiles){
// разные медиафайлы требуют свои события загрузки, для этого необходимы проверки
    if(file.tagName == 'IMG'){
        // обработчик картинка загружена
        file.onload = () => {
            i++;
            // картинки в данном случае загружаются быстрее, поэтому ограничил 90%
            percents.textContent = ((i * 90) / mediaFiles.length).toFixed(1);
            //фиксит баг в мобильном фаерфокс (он приоритетно сначала загружает аудио, поэтому показывает сначала 100% потом 90%) 
            if(res == 10) {
                percents.textContent = 100;
              }          
        }
    }
     if(file.tagName == 'AUDIO'){
        // обработчик файл готов к воспроизведению
        file.oncanplay = () => {
            res++;
            i++;
            percents.textContent = ((i * 100) / mediaFiles.length).toFixed(1);
            // 10 audio прописанных в HTML           
            if(res == 10) {
              percents.textContent = 100; // просто для красоты чтобы выводило 100% а не 100.0%
              btnStart.style.visibility = 'visible';
              btnStart.style.opacity = '1';
            }
        }
    }  
}
});
//Конец loader

window.onload = function() {
    // решаем проблему с браузерной строкой в мобильниках
    // используем переменную в CSS
    // получаем текущее значение высоты сразу при загрузке страницы
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);

  let btnStart = document.querySelector('.preloader .btn');
  let preloader = document.querySelector('.preloader');
  btnStart.focus();
      
  btnStart.onclick = () => {
    preloader.style.opacity = 0;
     
    let playerStartScreen = document.getElementById('playerStartScreen');
    playerStartScreen.play(); 
     
    setTimeout(()=> main(),1000);
  }
};
        
function main() {
    // решаем проблему с браузерной строкой в мобильниках
    // используем переменную в CSS
    // слушаем событие resize при изменении размера получаем текущее значение высоты
window.addEventListener('resize', () => {
  // получаем текущее значение высоты
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
});


 
let currentMusicState = playerStartScreen;//текущая музыка 
let volumeSwitchStateMusic = true;//состояние переключателя (вкл/откл музыки игры в настройках)
let volumeSwitchStateSound = true;//состояние переключателя (вкл/откл звуков игры в настройках)
let musicVolumeState;
let soundVolumeState;
let indexPointerM;
let indexPointerS;
let totalCards = 4;//общее количество карточек на игровом поле (изначально)
let lvl = 1;
let allScore = 0; // очки всей игры
let recordsScore = localStorage.getItem('score') ?? 0;// очки попадающие в рекорды либо из локального хранилища либо 0
let recordsLvl = localStorage.getItem('lvl') ?? 0;// уровень попадающий в рекорды либо из локального хранилища, либо 0
let lvlComplite = false;// определяет пройден уровень или нет
let audio = document.querySelectorAll('audio');
let body = document.querySelector('BODY');
/*****************ВРЕМЯ ТАЙМЕРА**************/
    //Установка часов таймера (минуты, секунды)
let min = 7;
let sec = 30;
if(min < 10){
    min = '0'+ min;
}
if(sec < 10){
    sec ='0'+ sec;
}
let idBackgroundAnimationRecords // интервал анимации заднего фона в рекордах
let idRecordsTextAnimateCssTimeOut; //таймаут в рекордах для остановки анимации текста в css
let idStartTimeOut;//таймаут в рекордах для анимации фона
let idEndTimeOut;//таймаут в рекордах для анимации фона
let idTimer; // для остановки таймера интервала
let activeTabInterval; // Интервал отслеживающий каждую секунду активность вкладки браузера (для остановки таймера, анимации таймера, музыки)
let idAnimationProgress;
let oneTimeMusicDownload = false; //для разовой подгрузки общей музыки и звуков игры по действию пользователя
let stateGamePause = true;//состояние play/pause в игре

//удалили предоадер
body.firstElementChild.parentNode.removeChild(body.firstElementChild)

//функция отлючения музыки если вкладка браузера не активна
    function  browserActiveTabControl(){
        let minutes = document.querySelector('.min');
        let seconds = document.querySelector('.sec')
        if(currentMusicState){
            //если вкладка браузера активна и музыка не выключена в настройках и текущая музыка не заставка уровней, то проигрываем текущую музыку
            if (!document.hidden && currentMusicState.id != 'playerSplash'){
                
                if(volumeSwitchStateMusic && currentMusicState.id != 'playerLvlEndBad'  && currentMusicState.id != 'playerLvlEndGood' && stateGamePause){
                    currentMusicState.play();
                }
                if(minutes != null && seconds != null){
                    if(idTimer == 'off' && !(min == 0 && sec == 0) && stateGamePause && !lvlComplite){                  
                        progressTimerGame();
                        timerGame();
                    } 
            }
            }
            else {
              //  gamePause();
                currentMusicState.pause();
                clearInterval(idTimer);
                idTimer = 'off';
                cancelAnimationFrame(idAnimationProgress);
            }
        }
    }
   activeTabInterval = setInterval(()=> browserActiveTabControl(),1000);

body.insertAdjacentHTML('afterbegin', `
<div class="wrap_all">
    <header>
        <div class="box">
            <svg clip-path="url(#a)" viewBox="0 0 3060.942 640.986"><g style="opacity:1"><text psvg:layer="layer1" x="1648.831" y="1466.395" font-family="sans-serif" font-size="50" style="fill-opacity:1;stroke-width:2;stroke-opacity:1;stroke-linecap:butt;stroke-miterlimit:4;" transform="matrix(10.2772 -.106 .106 10.1872 -16894.916 -14265.317)">Совпадения</text></g>
            </svg>  
        </div>
    </header>
    <main>
        <div class="wrap_main">
            <div class="image_card_menu1">
                <img src="./imgs/svg/1.svg" alt="картинка_1" />
            </div>
            <div class="image_card_menu2">
                 <img src="./imgs/svg/121.svg" alt="картинка_2" />
            </div>
        </div>
    </main>
    <footer>
        <button class="btn">игра</button>
        <button class="btn">рекорды</button>
        <button class="btn">настройки</button>
    </footer>
    </div>
    `);
    
    changeScreenControl('startScreenMenu');
         

//анимация карточек 1 эран
let menu1 = document.querySelector('.image_card_menu1 img');
let menu2 = document.querySelector('.image_card_menu2 img');

let index1 = 55;
let index2 = 65;

function scale(){
    menu1.style.transform = 'scale(2)';
    menu1.style.transitionDuration = '.5s';
    menu2.style.transform = 'scale(2)';
    menu2.style.transitionDuration = '.5s';
    setTimeout(()=>{
        menu1.style.transform = 'scale(1)';
        menu2.style.transform = 'scale(1)';
    },400)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startAnimationCardFirstScreen() {
  await sleep(250);
  menu1.src = `./imgs/svg/${index1}.svg`;
  menu2.src = `./imgs/svg/${index2}.svg`;
  index1++;
  index2--;

  if(index1 === 61 && index2 === 59){
      scale();
      return;
  } 
  startAnimationCardFirstScreen();
}

startAnimationCardFirstScreen();
//конец анимации карточек 1 экран

//функция контроля изменения экранов
function changeScreenControl(screen){
    let wrapAll = document.querySelector('.wrap_all');
    if(screen != 'startScreenMenu'){
        wrapAll.style.display = 'none';
    }
    if(screen == 'exit'){
       //удаляем 1 ребенка body при выходе в начальное меню (это или опции или рекорды или игра)
        body.firstElementChild.parentNode.removeChild(body.firstElementChild)
        wrapAll.style.display = 'flex';
    }
    changeSoundControl(screen);
}
//функция контроля изменения музыки
//принимает 3 параметра: 1. Текущий экран, 2. Громкость музыки, 3.Громкость звуков. По умолчанию стоит самая высокая (от 0.1 до 1.0), (0.0 не учитываем).
function changeSoundControl(screen, musicVolumeState, soundVolumeState){
    //проверяет какая музыка звучит при смене экранов
  if(volumeSwitchStateMusic){ //если не отключена музыка в настройках
    if(screen != 'startScreenMenu'){
        playerStartScreen.pause();
        playerStartScreen.currentTime = 0;
        currentMusicState = null;
    }
    if(screen == 'exit'){
        playerRecords.pause(); 
        playerRecords.currentTime = 0;
        playerOptions.pause();
        playerOptions.currentTime = 0;
        playerGame.pause();
        playerGame.currentTime = 0;
        playerSplash.pause();
        playerSplash.currentTime = 0;
        openCardsSound.pause();
        openCardsSound.currentTime = 0;
        cardsMatchSound.pause();
        cardsMatchSound.currentTime = 0;
        closeCardsSound.pause();
        closeCardsSound.currentTime = 0;
        playerLvlEndGood.pause();
        playerLvlEndGood.currentTime = 0;
        playerLvlEndBad.pause();
        playerLvlEndBad.currentTime = 0;
        playerStartScreen.play();
        currentMusicState = playerStartScreen;
    }
    if(screen == 'records'){
        playerRecords.play(); 
        currentMusicState = playerRecords;
    }
    if(screen == 'options'){
        playerOptions.play();  
        currentMusicState = playerOptions;
    }
    if(screen == 'startPlayGame'){
        playerGame.src = `./sound/gameMusic/${randomMusicGame()}`;
        playerGame.play();
        
        playerGame.onstalled = (e) =>{
            console.log(e.target.readyState);
            console.log('плохое интернет соединение');
            alert('плохое интернет соединение')
        } 
        
        currentMusicState = playerGame;
         //Добавить в этой функции в условие if(screen == 'exit').
    }
    if(screen == 'lvlEndBad'){
        playerGame.pause();
        playerLvlEndBad.play();
        currentMusicState = playerLvlEndBad;
    }
    if(screen == 'lvlEndGood'){
        playerGame.pause();
        playerLvlEndGood.play();
        currentMusicState = playerLvlEndGood;
    }
   
  }
  if(volumeSwitchStateSound){ //если не отключены звуки в настройках
    if(screen == 'levelSplash'){
        playerLvlEndGood.pause();
        playerLvlEndGood.currentTime = 0;
        playerLvlEndBad.pause();
        playerLvlEndBad.currentTime = 0;
        playerSplash.play();
        currentMusicState = playerSplash;
    }
    if(screen == 'openCards'){
        openCardsSound.play();
        currentMusicState = playerGame;
    }
    if(screen == 'cardsMatch'){
        cardsMatchSound.play();
        currentMusicState = playerGame;
    }
    if(screen == 'closeCards'){
        closeCardsSound.play();
        currentMusicState = playerGame;
    }
  }
  //конец проверки

    //уровень громкости музыки во всей игре
    if(musicVolumeState){
        for(let i of audio){
            if(i.className == 'music'){
                i.volume = musicVolumeState;
           }
       
        }
    }
    //уровень громкости звуков во всей игре
    if(soundVolumeState){
        for(let k of audio){
          if(k.className == 'sound'){
             k.volume = soundVolumeState;
           }
        }
    }
}
//кнопки старт, рекорды и настройки
let btn = document.querySelectorAll('.wrap_all .btn');

btn[0].onclick=(e)=>{
    changeScreenControl('levelSplash');
    levelSplash();
}
btn[1].onclick=(e)=>{
    changeScreenControl('records');
    records();
}
btn[2].onclick=(e)=>{
    changeScreenControl('options');
    options();
}
//заставка уровня
async function levelSplash(){
    body.insertAdjacentHTML('afterbegin', `
        <div class="wrapLevelSplash">
            <div class="levelTextBox">
                <h2>Уровень ${lvl}</h2>
            </div>
        </div>
    `);
    if(!oneTimeMusicDownload){
    //подгружаем заранее музыку по клику пользователя
//убираем звук подружаемой музыки
    playerLvlEndBad.volume = 0;
    playerGame.volume = 0;
    try{
      await playerGame.play();
      
      playerGame.pause();
    }catch(err){
        console.log(err + 'ошибка в промисе игровой музыки')
    }
    try{
      await playerLvlEndBad.play();  
      playerLvlEndBad.pause();
      //возвращаем звук подгоуженной музыки
      playerLvlEndBad.volume = musicVolumeState?? 1;
      playerGame.volume = musicVolumeState ?? 1;
    }catch(err){
        console.log(err + 'ошибка в промисе музыки окончания таймера игры')
    }
  }
    //конец подгрузки общей музыки

    await sleep(3500)
    oneTimeMusicDownload = true
    changeScreenControl('startPlayGame');
    body.firstElementChild.parentNode.removeChild(body.firstElementChild)
    playerSplash.currentTime = 0;
    startPlayGame()
}

function startPlayGame(){  
    lvlComplite = false;
    let score = 0;//очки уровня
     //Количество карточек на каждом четном уровне, кроме 2 уровня
    //пока что максимум 22 карточки
    if(lvl % 2 == 0 && lvl > 2 && lvl <= 20){
        totalCards +=2;
    }
    //увеличиваем время через каждые пройденные 10 уровней
    if(lvl % 10 == 0){
        min = 11;
        sec = 30;
    }
    body.insertAdjacentHTML('afterbegin', 
    `<div class="wrapGame">
        <div class="headerGame">
            <div class="wrapTimer">
                <div class="timer"><span class="min">${min}</span><span class="min">:</span><span class="sec">${sec}</span></div>
            </div>
            <div class="wrapPause">
                <button class="btn pause">пауза</button>
            </div>
            <div class="wrapExit">
                <button class="btn exit">выход</button>
            </div>
        </div>
        <div class="mainGame">
            <div class="container">
                <div class="particles">
                    <span style="--k:13;"></span>
                    <span style="--k:31;"></span>
                    <span style="--k:25;"></span>
                    <span style="--k:16;"></span>
                    <span style="--k:23;"></span>
                    <span style="--k:20;"></span>
                    <span style="--k:10;"></span>
                    <span style="--k:11;"></span>
                    <span style="--k:14;"></span>
                    <span style="--k:10;"></span>
                    <span style="--k:9;"></span>
                    <span style="--k:22;"></span>
                    <span style="--k:6;"></span>
                    <span style="--k:19;"></span>
                    <span style="--k:22;"></span>
                    <span style="--k:28;"></span>
                    <span style="--k:15;"></span>
                    <span style="--k:37;"></span>
                    <span style="--k:13;"></span>
                    <span style="--k:31;"></span>
                    <span style="--k:25;"></span>
                    <span style="--k:16;"></span>
                    <span style="--k:23;"></span>
                    <span style="--k:20;"></span>
                    <span style="--k:10;"></span>
                    <span style="--k:11;"></span>
                    <span style="--k:14;"></span>
                    <span style="--k:10;"></span>
                    <span style="--k:9;"></span>
                    <span style="--k:22;"></span>
                    <span style="--k:6;"></span>
                    <span style="--k:19;"></span>
                    <span style="--k:22;"></span>
                    <span style="--k:28;"></span>
                    <span style="--k:15;"></span>
                    <span style="--k:47;"></span> 
                       
                </div>
            </div>
            <div class="pauseBlock">
                <div>пауза</div>
            </div>
            <div class="sideBarGame">
                <div class="divLvl"><p>уровень:</p><span>${lvl}</span></div>
                <div class="divScore"><p>очки:</p><span>${score}</span></div>
                <div class="animationBlock"></div>
            </div>
            <div class="gamePole">
            </div>
        </div>
        
    </div>`)
  let gamePole = document.querySelector('.gamePole');
  let animationBlock = document.querySelector('.animationBlock');
  let mainGame = document.querySelector('.mainGame');
  //массив открытых карточек
  let openCardsId = [];//массив двух открытых карточек (их индексы)
  let cardsRotate = []; //массив указателей на карты которые нужно повернуть обратно, учитывает 2 карточки лицевую и оборотную сторону и обнуляется
  let cardsMatch = [];//массив для проверки двух совпавших карточек, содержит ссылки на ноды в DOM.
  let doubleCardsOpen; //переменная для проверки дублирования открытия одной и тойже карточки
  //увеличение очков при нескольких совпадениях подряд
  let increasedPoints = 1;

  //получили массив рандомных картинок 
  let cardsArray = randomCardGame();
  //клонировали массив рандомных картинок и перемешали его
  let resultArrayCards = [].concat(cardsArray, cardsArray).sort(() => Math.random() - 0.5);
      //создаем карточки в игровом поле
    for(let i = 0; i < totalCards; i++){
        //обертка карточек
        let gameCard = document.createElement('div');
        gameCard.classList.add('gameCard');
        gamePole.append(gameCard);
        //лицевая сторона карточек
        let frontSideCard = document.createElement('div');
        frontSideCard.classList.add('frontSideCard');
        //установили атрибут каждой карточки, чтобы в дальнейшем проверять открытые карточки на совпадения
        frontSideCard.setAttribute('card',`${resultArrayCards[i]}`);
        //установили атрибут каждой карточки, чтобы в дальнейшем проверять открытые карточки на дублирование открытия
        frontSideCard.setAttribute('number', `${i+1}`);
        gameCard.append(frontSideCard);
        //оборотная сторона карточек
        let backSideCard = document.createElement('div');
        backSideCard.classList.add('backSideCard');
        gameCard.append(backSideCard);
        //картинки оборотной стороны карточек
                
        let img = document.createElement("IMG");
        //вместо i будет вызов функции из массива по рандому
        img.src = `./imgs/svg/${resultArrayCards[i]}.svg`
        backSideCard.append(img);
        /**************************************************************************/ 
        resizeCards();//меняем размер карточек по мере их увеличения
        /**************************************************************************/

        //обработчик открытия карточек
        frontSideCard.addEventListener('click', openCards);
        async function openCards(e){
            if(min == 0 && sec == 0) return;   
            

            /*если открыли одну карточку и следующее открытие совпадает с ней же то ничего не делаем
              это устраняет проблему двойного клика по одной и тойже карточке
              иначе в массив openCardsId запишется значение из одной карточки и будет баг*/
            if(doubleCardsOpen && doubleCardsOpen == frontSideCard.getAttribute('number')) return;
            //записали номер карточки для проверки на двойное открытие одной карточки (дважды) даблкликом 
            doubleCardsOpen = frontSideCard.getAttribute('number');

            if(openCardsId.length < 2){
               changeSoundControl('openCards');
               openCardsId.push(frontSideCard.getAttribute('card'));
               
               cardsRotate.push([frontSideCard, backSideCard]);
               
               frontSideCard.style.transform = "rotateY(180deg)";
               backSideCard.style.transform = "rotateY(360deg)";
               openCardsSound.currentTime = 0;
            }           
            if(openCardsId.length == 2){
               changeSoundControl('openCards');
                //пришлось задублировать иначе ошибка при нажатии последовательно 4 карточек, не находит значение
               openCardsId.push(frontSideCard.getAttribute('card'));
               
               cardsRotate.push([frontSideCard, backSideCard]);
               
               frontSideCard.style.transform = "rotateY(180deg)";
               backSideCard.style.transform = "rotateY(360deg)";
               openCardsSound.currentTime = 0;
              if(openCardsId[0] != openCardsId[1]){
               await sleep(1000)
               //поворачиваем обратно несовпавших две карточки через секунду
               cardsRotate[0][0].style.transform = "rotateY(0deg)";
               cardsRotate[0][1].style.transform = "rotateY(180deg)";
               cardsRotate[1][0].style.transform = "rotateY(0deg)";
               cardsRotate[1][1].style.transform = "rotateY(180deg)";
               //звук закрытия несовпавших двух карточек
               changeSoundControl('closeCards');
               //если не совпали карточки оставляем бонус увеличения по дефолту
               increasedPoints = 1;
               //при несовпадении карточек бонус увеличения очков отсутствует
               animationBlock.innerText = '';
              }else{
                  //если карточки совпадают
                  //звук двух совпавших карточек
                changeSoundControl('cardsMatch');
                cardsMatchSound.currentTime = 0;
                //увеличиваем очки игры
                let divScore = document.querySelector('.divScore span')
                //вместо innerText написать функцию анимации
                if(increasedPoints > 1){
                    divScore.innerText = score += increasedPoints;
                    //добавили анимацию бонуса увеличения очков
                    animationBlock.innerText = `x${increasedPoints}`;
                }else{
                    divScore.innerText = ++score;
                }
                //увеличиваем бонус совпадений на следующий ход
                increasedPoints++;
                //конец уровня
                //добавляем в массив одну из совпавших карточек
                cardsMatch.push(frontSideCard);
                //Сравниваем количество совпавших карточек (по одной из совпавших) с изначальным количеством загруженных карточек и если все карточки совпали останавливаем таймер и заканчиваем уровень
                if(cardsMatch.length == cardsArray.length){
                    await sleep(1000);
                    //уровень пройден
                    lvlComplite = true;
                if(recordsLvl < lvl){
                    recordsLvl = lvl;
                    localStorage.setItem('lvl',`${recordsLvl}`);//записали уровень в локальное хранилище
                 }
                    //увеличиваем уровень 
                    lvl++;
                    
                    //останавливаем часы и прогресс
                    clearInterval(idTimer);
                    cancelAnimationFrame(idAnimationProgress);
                    //сразу очищаем массив совпавших карточек
                    cardsMatch = [];
                    changeSoundControl('lvlEndGood');
                    //предыдущие все очки игры, по дефолту 0
                    let previousAllScore = allScore;
                    //добавляем очки уровня к общим очкам всей игры
                    allScore += score;
                    //добавляем общие очки к очкам в таблице рекордов если старый рекорд меньше новых очков уровней
                    if(recordsScore < allScore){
                        recordsScore = allScore;
                        localStorage.setItem('score',`${recordsScore}`);//записали очки в локальное хранилище
                    }
                    mainGame.insertAdjacentHTML('afterbegin', `
                    <div class="wrapNextLvl">
                      <div class="nextLvlMenu">
                        <div>
                            <p><span>Уровень:&nbsp;</span><span>${lvl - 1}</span></p>
                        </div>
                        <div>
                            <p><span>Очки:&nbsp;</span><span class="allScore">${previousAllScore}</span></p>
                        </div>
                        <div>
                          <button id="btn" class="btn btnNexLvl">следующий уровень</button>
                        </div>
                      </div>
                    </div>`);
                    
                    
                    (() => {
                        let idTimeOut = setTimeout(()=>{
                        let btnNextLvl = document.querySelector('#btn');
                        btnNextLvl.style.visibility = 'visible';
                        btnNextLvl.style.opacity = '1';
                        clearTimeout(idTimeOut);
                    }, 5000)
                    }
                    )();
                    
                    //функция анимации очков в конце каждого уровня будет добавлять новые общие очки к предыдущим
                    (async()=>{
                        await sleep(1000); //ждем секунду для появления заставки
                        let scoreLvl = document.querySelector('.allScore');
                        let i = previousAllScore;
                        let intervalScoreLvl = setInterval(async ()=>{
                            ++i;
                            scoreLvl.textContent = i;
                            if(i == allScore){
                                scoreLvl.style.transform = 'scale(2.5)';
                                clearInterval(intervalScoreLvl);
                                await sleep(400);
                                scoreLvl.style.transform = 'scale(1)';
                            }
                        }, 100);
                        
                    })();
                    
                    //сначала анимация уровня потом очков 
                    // console.log(currentMusicState.duration); //5.891167 длина музыки при прохождении уровня
                    // для рекламы

                    //остановка анимации на заднем плане игры
                    let animationBakgroundGame = document.querySelectorAll('.particles > span');
                    for(let i of animationBakgroundGame){
                        i.style.animationPlayState = 'paused';
                    }
                    //перекрываем черным цветом header чтобы небыло видно остановленных кусков анимации
                    let header = document.querySelector('.headerGame');
                    header.style.backgroundColor = 'black';
                    let btnNexLvl = document.querySelector('.btnNexLvl');
                    btnNexLvl.onclick=(e)=>{
                      //убираем игру, чтобы не перекрывала заставку уровней и не дублировалось
                        body.firstElementChild.parentNode.removeChild(body.firstElementChild)
                     // wrapGame.style.display='none'
                      //заставка уровней
                      levelSplash();
                      //звук заставки уровней
                      changeScreenControl('levelSplash');
                    }
                }
                //сюда вставить асинхронную анимацию зачисления баллов
              }
              //очищаем массивы при совпадении и несовпадении карточек
              openCardsId = [];
              cardsRotate = [];
              doubleCardsOpen = undefined;
            }
            
        }

    }
    
    //обработчик кнопки паузы в игре
    let btnPause = document.querySelector('.pause');
    btnPause.addEventListener('click', ()=>{
        let header = document.querySelector('.headerGame');
        if(min == 0 && sec == 0 || lvlComplite) return;
        if(stateGamePause){ 
            header.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; //корректировка header по цвету при паузе
            btnPause.innerText = 'играть';
            gamePauseOn();
        }else{
            header.style.backgroundColor = 'transparent'; //корректировка header по цвету при отключении паузы
            btnPause.innerText = 'пауза';
            gamePauseOff();
        }
    });
    exit();    //кнопка выход из игры
    timerGame();//запуск таймера
    progressTimerGame(); // вызываем движение прогрессбара
}
    

//функция кнопки паузы в игре
function gamePauseOn(){
    let pauseBlock = document.querySelector('.pauseBlock');
     stateGamePause = false;
     currentMusicState.pause();
     clearInterval(idTimer);
     cancelAnimationFrame(idAnimationProgress);
     pauseBlock.style.display= 'block';
}
//функция отмены кнопки паузы в игре
function gamePauseOff(){
    let pauseBlock = document.querySelector('.pauseBlock');
    stateGamePause = true;
    progressTimerGame();
    timerGame();
    pauseBlock.style.display= 'none';
}

function options(){
    body.insertAdjacentHTML('afterbegin', `
        <div class="wrapOptions">
            <div class="area" >
                <ul class="stars">
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                        <li></li>
                </ul>
            </div >
            <h2>Настройки</h2>
            <div class="btnAllSwichOptions">      
                <div class="btnTogller">
                    <p>музыка:</p>
                    <div class="${volumeSwitchStateMusic ? "soundSwitchMusic" : ["soundSwitchMusic", "activeBtnSwitch"].join(' ')}">       
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <p>${volumeSwitchStateMusic ? 'вкл': 'выкл'}</p>
                    </div>
                </div>
                <div class="btnTogller">
                    <p>звук:</p>
                    <div class="${volumeSwitchStateSound ? "soundSwitchSound" : ["soundSwitchSound", "activeBtnSwitch"].join(' ')}">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                        <p>${volumeSwitchStateSound ? 'вкл': 'выкл'}</p>
                    </div>
                </div>
            </div>
            <div class="wrapVolume">
                <div class="volumeMusic">
                    <div><p>громкость музыки:</p></div>
                    <div class="musicVolumeScale">
                        <span class="volumeM"></span><span class="volumeM"></span><span class="volumeM"></span><span class="volumeM"></span><span class="volumeM"></span><span class="volumeM"></span><span class="volumeM"></span><span class="volumeM"></span><span class="volumeM"></span><span class="volumeM"></span></div>
                </div>
                <div class="volumeSounds">
                    <div><p>громкость звука:</p></div>
                    <div class="soundVolumeScale">
                        <span class="volumeS"></span><span class="volumeS"></span><span class="volumeS"></span><span class="volumeS"></span><span class="volumeS"></span><span class="volumeS"></span><span class="volumeS"></span><span class="volumeS"></span><span class="volumeS"></span><span class="volumeS"></span></div>
                </div>
            </div>
            <button class="exit btn">выход</button>
        </div>
    `)
    // Стили шкалы громкости музыки и звуков
    let wrapVolumeSpan = document.querySelectorAll('.wrapVolume span');
    let x = 90;
    for(let k of wrapVolumeSpan){
        if(k.className == 'volumeM'){
            k.style.top = x + '%';
            x -= 10;
        }
    }
    x = 90;
    for(let i of wrapVolumeSpan){
        if(i.className == 'volumeS'){
            
            i.style.top = x + '%';
            x -= 10;
        }
    }
    // конец стилей шкалы громкости и звуков
   
    let btnSwitchMusic = document.querySelector('.soundSwitchMusic');
    let btnSwitchMusicText = document.querySelector('.soundSwitchMusic p');
    let musicVolumeScale = document.querySelector('.musicVolumeScale');
    //начальное состояние определяющее наложен фильтр на отключенную музыку или нет
    if(!volumeSwitchStateMusic){
        musicVolumeScale.style.filter = 'grayscale(1)';
    }else{
        musicVolumeScale.style.filter = 'grayscale(0)';
    }
     //Заглушить/Включить музыку 
    btnSwitchMusic.addEventListener('click', ()=>{
        btnSwitchMusic.classList.toggle('activeBtnSwitch');
        volumeSwitchStateMusic = !volumeSwitchStateMusic;
        if(!volumeSwitchStateMusic){       
            btnSwitchMusicText.textContent = 'выкл';
            musicVolumeScale.style.filter = 'grayscale(1)';
            for(let i of audio){
                if(i.className == 'music'){
                    i.pause();
                    i.currentTime = 0;
                }
            }
        }
        else{
            musicVolumeScale.style.filter = 'grayscale(0)';
            changeSoundControl('options');
            btnSwitchMusicText.textContent = 'вкл';
        }
    });
    //конец заглушки музыки
    
    let btnSwitchSound = document.querySelector('.soundSwitchSound');
    let btnSwitchSoundText = document.querySelector('.soundSwitchSound p');
    let soundVolumeScale = document.querySelector('.soundVolumeScale');
    //начальное состояние определяющее наложен фильтр на отключенные звуки или нет
    if(!volumeSwitchStateSound){
        soundVolumeScale.style.filter = 'grayscale(1)';
    }else{
        soundVolumeScale.style.filter = 'grayscale(0)';
    }

    //Заглушить/Включить звуки 
    btnSwitchSound.addEventListener('click', ()=>{
    btnSwitchSound.classList.toggle('activeBtnSwitch');
    volumeSwitchStateSound =! volumeSwitchStateSound;
        if(!volumeSwitchStateSound){
            btnSwitchSoundText.textContent = 'выкл';
            soundVolumeScale.style.filter = 'grayscale(1)';
            for(let i of audio){
                if(i.className == 'sound'){
                    i.pause();
                    i.currentTime = 0;
                }
            }
        } else{
            soundVolumeScale.style.filter = 'grayscale(0)';
            btnSwitchSoundText.textContent = 'вкл';
        }
    });
     //конец заглушки звуков
    
    //Подсветка шкалы громкости музыки и звуков
    let wrapVolume = document.querySelector('.wrapVolume');
    let volumeM = document.querySelectorAll('.volumeM');
    let volumeS = document.querySelectorAll('.volumeS');
    if(indexPointerM != undefined){
        for(let i = 0; i < volumeM.length; i++){
             if(i <= indexPointerM){
                 volumeM[i].style.backgroundColor = 'orange';
             }else{
                 volumeM[i].style.backgroundColor = '#A9A9A9';
             }
          }
    }
    if(indexPointerS != undefined){
         for(let k = 0; k < volumeS.length; k++){
             if(k <= indexPointerS){
                 volumeS[k].style.backgroundColor = 'orange';
             }else{
                 volumeS[k].style.backgroundColor = '#A9A9A9';
             }
         }
        
    }

    let wrapOptions = document.querySelector('.wrapOptions');
    //обработчики
    //клик на уровне музыки и звуков
   wrapVolume.onpointerdown = handler;
   
   //снимаем обработчик движения на уровне звуков и музыки при отпускании кнопки мышы или отрыве от экрана пальца
   wrapOptions.onpointerup = ()=>{
    wrapVolume.removeEventListener('pointermove',  handler);
}
    function handler(e){
       
        let x = e.clientX, y = e.clientY
        let elementPoint = document.elementFromPoint(x,y)//показываем элемент над которым проходит мышь

        //если вышли за экран
        if(elementPoint == null || elementPoint == undefined){
            wrapVolume.removeEventListener('pointermove',  handler);
            return;
        }
        if(elementPoint.className == 'volumeM'){
            indexPointerM = Array.from(volumeM).indexOf(elementPoint)
            
            for(let i = 0; i < volumeM.length; i++){
                if(i <= indexPointerM){
                    volumeM[i].style.backgroundColor = 'orange';
                }else{
                    volumeM[i].style.backgroundColor = '#A9A9A9';
                }
            }
            //тут меняем громкость музыки (прибавили 1 так как шкала изменения музыки идет с 1, а не с 0 как в индексе)
            musicVolumeState = (indexPointerM+1) / 10;
            changeSoundControl('options', musicVolumeState, undefined)
         }
        
        if(elementPoint.className == 'volumeS'){
            indexPointerS = Array.from(volumeS).indexOf(elementPoint)
            
            for(let i = 0; i < volumeS.length; i++){
                if(i <= indexPointerS){
                    volumeS[i].style.backgroundColor = 'orange';
                }else{
                    volumeS[i].style.backgroundColor = '#A9A9A9';
                }
            }
        
            //тут меняется громкость звуков 
            soundVolumeState = (indexPointerS+1) / 10;
            changeSoundControl('options', undefined, soundVolumeState)
            if(volumeSwitchStateSound){
                openCardsSound.play();//звук открывающейся карточки при выборе громкости
            }
        }
        // обработчик при движении пальцем или мышкой по шкале уровня музыки и звуков
        wrapVolume.addEventListener('pointermove',  handler);
        
    }
     //конец подсветки шкалы громкости музыки и звуков
    exit();//функция выхода в главное меню, вынесена т.к. ее используют все экраны
    
}

//функция изменения размера карточек по мере их возрастания на поле
function resizeCards(){
    let cards = document.querySelectorAll('.gameCard');
    for(let i of cards){
        if(cards.length == 4){
            i.style.height = "35vmin";
            i.style.width = "35vmin";
        }
        if(cards.length == 6){
            i.style.height = "30vmin";
            i.style.width = "30vmin";
        }
        if(cards.length == 8){
            i.style.height = "25vmin";
            i.style.width = "25vmin";
        }
        if(cards.length == 10 || cards.length == 12){
            i.style.height = "20vmin";
            i.style.width = "20vmin";
        }
        if(cards.length == 14 || cards.length == 16){
            i.style.height = "18vmin";
            i.style.width = "18vmin";
        }
        if(cards.length == 18){
            i.style.height = "16vmin";
            i.style.width = "16vmin";
        }
        if(cards.length == 20){
            i.style.height = "15vmin";
            i.style.width = "15vmin";
        }
        if(cards.length == 22){
            i.style.height = "14vmin";
            i.style.width = "14vmin";
        }
    }
}

function exit(){
    let btnExit = document.querySelector('.exit');
    btnExit.onclick = function() {
    if(idTimer){
        clearInterval(idTimer);
        cancelAnimationFrame(idAnimationProgress);
        allScore = 0;//убираем очки игры в default
        lvl = 1;// убираем уровень в default
        min = 7; // восстанавливаем минуты
        sec = 30; // восстанавливаем секунды
        totalCards = 4; // восстанавливаем кол-во карточек
        stateGamePause = true;//если вышли из включенной паузы в игре, то восстанавливаем начальное состояние (снимаем паузу)
    }
    //если запущена css анимация текста в рекордах, то очищаем таймаут.
    if(idRecordsTextAnimateCssTimeOut){
        clearTimeout(idRecordsTextAnimateCssTimeOut);
    }
    //если запущена анимация заднего фона в рекордах, то очищаем интервал и таймауты
    if(idBackgroundAnimationRecords){
        clearInterval(idBackgroundAnimationRecords);
        clearTimeout(idStartTimeOut);
        clearTimeout(idEndTimeOut);
    }
    changeScreenControl('exit')
};
    
}

function records(){
    body.insertAdjacentHTML('afterbegin', `
        <div class="wrapRecords">
        <h1>Рекорды</h1>
        <h2>Уровень:&nbsp;<span>${recordsLvl ?? 0}</span></h2>
            <div class="recordsText">
                <span>В</span>
                <span>а</span>
                <span>ш</span>
                &nbsp;
                <span>р</span>
                <span>е</span>
                <span>к</span>
                <span>о</span>
                <span>р</span>
                <span>д</span>
                <span>:</span>
                <br>
                <span class="resultRecordsScore">${recordsScore ?? 0}</span>
            </div>
            <button class="btn exit">Выход
            </button>  
            <div class="wrapAnimation"></div>
        </div>
    `);
    //остановка css анимации движения текста
    let animationRecordsText = document.querySelectorAll('.recordsText span');
    for(let i of animationRecordsText){
        i.style.animationPlayState = 'paused';
    }
    //запуск css анимации текста 
    idRecordsTextAnimateCssTimeOut = setTimeout(()=>{
        for(let k of animationRecordsText){
            k.style.animationPlayState = 'running';
        }
    },2200)
    
    //анимация падения текста
    let x = 0
    let recordsText = document.querySelectorAll('.recordsText span');
    for(let j of recordsText){
        j.style.display = 'inline-block';
        j.style.transform = 'translateY(-150vh)';
        j.style.transition = '1s';
    }
    for(let y of recordsText){
        setTimeout(()=>{
             y.style.transform = 'translateY(0vh) ';
        },x +=100)
    }
    
    //создаём фон из плиток
    let wrapAnimation = document.querySelector('.wrapAnimation')
    for(let i = 0; i<=23; i++){
        let div = document.createElement('div');
        div.className = "divRecords";
        wrapAnimation.append(div);
    }
    
    let wrapAnimationDiv = document.querySelectorAll('.wrapAnimation div');
    
  //анимация фона  
   idBackgroundAnimationRecords = setInterval(()=>{
      let time = 1000;
      let x = 0;
      let y = 0;
    for(let k of wrapAnimationDiv){
        idStartTimeOut = setTimeout(()=>{
            k.style.filter = 'drop-shadow(0 0 0.75em black)';
            k.style.transition = "1s";
        },x += time)
        idEndTimeOut = setTimeout(()=>{
              k.style.filter = 'drop-shadow(0 0 0.75em #9F0024)';
              k.style.transition = "1.7s";
        }, y += 1700)
    }
  }, 2800)
    
    exit();
}

//возвращает рандомную музыку для игры
function randomMusicGame(){
    let min = 1;
    let max = 19; // выбираем максимум песен в папке
    let result = Math.floor(min + Math.random() * (max + 1 - min));
    return (result + '.mp3')
}

//возвращает рандомные картинки для игрового поля
function randomCardGame(){
    let cardArray = [];
    let min = 1;
    let max = 236; // выбираем максимум карточек в папке
    // нужно тестировать на ошибки
    function rand(){
        //result это половины карточек текущей игры минус длинна массива (по дефолту она 0, но если были дубли 
        // и количество карточек нарушено то повторный запуск функции rand должен вызывать цикл на недостающее кол-во
        // карточек)
        let result = totalCards/2 - cardArray.length;
        for(let i = 0; i < result; i++){
            cardArray.push(Math.floor(min + Math.random() * (max + 1 - min)))
        }
        //сделали уникальный массив значений и перезаписали старый массив
        cardArray = Array.from(new Set(cardArray));
        // из-за уникальности дубли уйдут и количество карточек будет нарушено нужно вызывать rand() пока не достигнем
        // результата totalCards/2 (т.е. половины карточек текущей игры)
        if(cardArray.length != totalCards/2){
            rand();
        }
    }
    rand();
    

    return (cardArray)
}

//функция таймера
function timerGame(func){
  let minutes = document.querySelector('.min');
  let seconds = document.querySelector('.sec')
//зацикливаем вызов функции и очищаем интервал когда наступит 0 мин 0 сек
    idTimer = setInterval(function(){
      sec--;
  if(min == 0 && typeof min != 'string'){
    min = '0'+ min;
  }
  if(sec < 10) sec = '0' + sec;
  if(sec == '0-1'){
    min--;
    if(min < 10){
    min = '0'+ min;
    }
    sec = 59;
    minutes.innerText = min;
    seconds.innerText = sec;
  }
  if(min == 0 && sec == 0){
    clearInterval(idTimer);
    changeSoundControl('lvlEndBad');
    restartGame();//начать игру снова
  }

 //добавляем минуты и секунды на страницу
  minutes.innerText = min;
  seconds.innerText = sec;
    },1000);
}

//начать игру снова если проиграл
function restartGame(){
    let mainGame = document.querySelector('.mainGame');
    mainGame.insertAdjacentHTML('afterbegin', `
    <div class="wrapNextLvl">
        <div class="nextLvlMenu">
            <div>
                <p><span>Уровень:&nbsp;</span><span>${lvl}</span></p>
            </div>
            <div>
                <p><span>Всего:&nbsp;</span><span>${allScore}</span></p>
            </div>
            <div>
                <button class="btn btnNexLvl">играть снова</button>
            </div>           
        </div>
    </div>`);

    let btnNexLvl = document.querySelector('.btnNexLvl');
    btnNexLvl.style.visibility = 'visible';
    btnNexLvl.style.opacity = '1';
    btnNexLvl.onclick=(e)=>{
        //убираем игру, чтобы не перекрывала заставку уровней и не дублировалось
        body.firstElementChild.parentNode.removeChild(body.firstElementChild)
        allScore = 0;//убираем очки игры в default
        lvl = 1;// убираем уровень в default
        min = 7;
        sec = 30;
        totalCards = 4;
        //заставка уровней
        levelSplash();
        //звук заставки уровней
        changeScreenControl('levelSplash');
    }
}


function progressTimerGame (){
    let timer = document.querySelector('.timer')
    let start = performance.now();
    let duration = (min * 60 + sec) * 1000;
   
    requestAnimationFrame(function animation(time){
    
    let timeFraction = (time - start) / duration;
    if (timeFraction > 1) timeFraction = 1;
    //настройки цвета линии
    let step = timeFraction * 100;
    timer.style.background = `linear-gradient(to right, #37dd0d ${step + '%'}, transparent ${step +'%'})`;
    if(timeFraction > 0.5){
      timer.style.background = `linear-gradient(to right, orange ${step + '%'}, transparent ${step +'%'})`;
    }
    if(timeFraction > 0.8){
      timer.style.background = `linear-gradient(to right, red ${step +'%'}, transparent ${step +'%'})`;
    }
    if (timeFraction < 1) {
      idAnimationProgress = requestAnimationFrame(animation);
    }else{
        cancelAnimationFrame(idAnimationProgress);
    }
    
    });
   
}

}
    