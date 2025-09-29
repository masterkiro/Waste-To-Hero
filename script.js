class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.gameState = 'menu'; // menu, playing, paused, gameover
    this.score = 0;
    this.level = 1;
    this.timeLeft = 60;
    this.gameTimer = null;
    this.trashBins = [];
    this.trashItems = [];
    this.mouse = { x:0, y:0, pressed:false, dragging:null };
    this.touch = { x:0, y:0, active:false, dragging:null };

    // ✅ Fun Facts
    this.funFacts = [
      "Sampah organik seperti sisa makanan bisa jadi kompos, tapi kalau tercampur plastik atau baterai, kompos bisa tercemar.",
      "Masker bekas, baterai, dan limbah kimia termasuk sampah B3, jadi harus dipisahkan agar tidak mencemari lingkungan.",
      "Reduce lebih penting daripada Recycle karena bisa mencegah timbulnya sampah sejak awal dan mengurangi energi pengolahan.",
      "Sampah plastik butuh ratusan tahun terurai, makanya penting dipilah agar tidak mencemari sampah organik.",
      "Kalau organik dan anorganik tercampur, proses daur ulang jadi lebih sulit dan bisa mencemari lingkungan.",
      "Tempat sampah hijau untuk organik, kuning untuk anorganik, dan merah untuk residu atau B3 berbahaya."
    ];

    this.setupCanvas();
    this.setupInput();
    this.loadHighScore();
    this.render();
  }

  setupCanvas() {
    if (window.innerWidth < 800) {
      this.canvas.width = window.innerWidth - 40;
      this.canvas.height = 400;
    }
    this.createTrashBins();
  }

  setupInput() {
    // touch
    this.canvas.addEventListener('touchstart', (e)=>{ e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      this.touch.x = (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width);
      this.touch.y = (e.touches[0].clientY - rect.top) * (this.canvas.height / rect.height);
      this.touch.active = true;
      this.handleTouchStart();
    }, {passive:false});
    this.canvas.addEventListener('touchmove', (e)=>{ e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      this.touch.x = (e.touches[0].clientX - rect.left) * (this.canvas.width / rect.width);
      this.touch.y = (e.touches[0].clientY - rect.top) * (this.canvas.height / rect.height);
      this.handleTouchMove();
    }, {passive:false});
    this.canvas.addEventListener('touchend', ()=>{ this.touch.active=false; this.handleTouchEnd(); });

    // mouse
    this.canvas.addEventListener('mousedown', (e)=>{
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
      this.mouse.pressed = true;
      this.handleMouseDown();
    });
    this.canvas.addEventListener('mousemove', (e)=>{
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
      this.mouse.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
      this.handleMouseMove();
    });
    this.canvas.addEventListener('mouseup', ()=>{ this.mouse.pressed=false; this.handleMouseUp(); });

    // buttons
    document.getElementById('startButton').addEventListener('click', ()=>this.startGame());
    document.getElementById('pauseButton').addEventListener('click', ()=>this.togglePause());
    document.getElementById('menuStartButton').addEventListener('click', ()=>this.startGame());
    document.getElementById('restartButton').addEventListener('click', ()=>this.restartGame());
  }

  createTrashBins() {
    const colors = ['#4caf50','#ffeb3b','#f44336'];
    const types = ['organic','anorganik','residu'];
    const labels = ['Organik','Anorganik','Residu'];
    this.trashBins = [];
    for (let i=0;i<3;i++){
      this.trashBins.push({
        x: i*(this.canvas.width/3)+40,
        y: this.canvas.height-80,
        width: (this.canvas.width/3)-60,
        height: 70,
        color: colors[i],
        type: types[i],
        label: labels[i]
      });
    }
  }

  createTrashItem() {
    const types = ['organic','anorganik','residu'];
    const type = types[Math.floor(Math.random()*types.length)];
    const size = 50 + Math.random()*30;
    const symbols = {
      'organic':['🍎','🍌','🍂'],
      'anorganik':['🥤','📄','🥡'],
      'residu':['🧪','🗑️','💡','😷','🧤'] // ✅ tambah masker & gloves
    };
    const symbolList = symbols[type];
    const symbol = symbolList[Math.floor(Math.random()*symbolList.length)];
    const colors = {'organic':'#4caf50','anorganik':'#ffeb3b','residu':'#f44336'};
    const trashItem = {
      x: Math.random()*(this.canvas.width - size),
      y: -size,
      width: size,
      height: size,
      type: type,
      speed: 1 + (this.level*0.15),
      color: colors[type] || '#999',
      symbol: symbol
    };
    this.trashItems.push(trashItem);
  }

  isPointInRect(x,y,rect){
    return x>=rect.x && x<=rect.x+rect.width && y>=rect.y && y<=rect.y+rect.height;
  }

  handleMouseDown(){
    if (this.gameState!=='playing') return;
    for (let i=this.trashItems.length-1;i>=0;i--){
      const item = this.trashItems[i];
      if (this.isPointInRect(this.mouse.x,this.mouse.y,item)){
        this.mouse.dragging = item;
        break;
      }
    }
  }
  handleMouseMove(){
    if (this.mouse.dragging && this.mouse.pressed){
      this.mouse.dragging.x = this.mouse.x - this.mouse.dragging.width/2;
      this.mouse.dragging.y = this.mouse.y - this.mouse.dragging.height/2;
    }
  }
  handleMouseUp(){
    if (this.mouse.dragging){
      this.checkTrashDisposal(this.mouse.dragging);
      this.mouse.dragging = null;
    }
  }

  handleTouchStart(){
    if (this.gameState!=='playing') return;
    for (let i=this.trashItems.length-1;i>=0;i--){
      const item = this.trashItems[i];
      if (this.isPointInRect(this.touch.x,this.touch.y,item)){
        this.touch.dragging = item;
        break;
      }
    }
  }
  handleTouchMove(){
    if (this.touch.dragging && this.touch.active){
      this.touch.dragging.x = this.touch.x - this.touch.dragging.width/2;
      this.touch.dragging.y = this.touch.y - this.touch.dragging.height/2;
    }
  }
  handleTouchEnd(){
    if (this.touch.dragging){
      this.checkTrashDisposal(this.touch.dragging);
      this.touch.dragging = null;
    }
  }

  checkCollision(a,b){
    return a.x < b.x+b.width && a.x+a.width > b.x && a.y < b.y+b.height && a.y+a.height > b.y;
  }

  checkTrashDisposal(trashItem){
    for (const bin of this.trashBins){
      if (this.checkCollision(trashItem,bin)){
        if (bin.type === trashItem.type){
          this.score += 10;
          this.playSound('correct');
          const idx = this.trashItems.indexOf(trashItem);
          if (idx>=0) this.trashItems.splice(idx,1);
          if (this.score % 100 === 0) { this.level++; this.playSound('levelup'); }
          this.updateUI();
          return;
        } else {
          this.score = Math.max(0, this.score - 5);
          this.playSound('wrong');
          const idx2 = this.trashItems.indexOf(trashItem);
          if (idx2>=0) this.trashItems.splice(idx2,1);
          this.updateUI();
          return;
        }
      }
    }
    const idx3 = this.trashItems.indexOf(trashItem);
    if (idx3>=0) this.trashItems.splice(idx3,1);
  }

  update(deltaTime){
    if (this.gameState!=='playing') return;
    for (let i=this.trashItems.length-1;i>=0;i--){
      const item = this.trashItems[i];
      item.y += item.speed;
      if (item.y > this.canvas.height){
        this.trashItems.splice(i,1);
        this.score = Math.max(0, this.score - 5);
        this.playSound('wrong');
        this.updateUI();
      }
    }
    if (Math.random() < 0.0055 * this.level) this.createTrashItem();
  }

  render(){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.ctx.fillStyle='#f8f9fa';
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

    for (const bin of this.trashBins){
      this.ctx.fillStyle = bin.color;
      this.ctx.fillRect(bin.x, bin.y, bin.width, bin.height);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '14px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(bin.label, bin.x + bin.width/2, bin.y + bin.height/2 + 6);
      this.ctx.font = '20px Arial';
      this.ctx.fillText('🗑️', bin.x + bin.width/2, bin.y + bin.height/2 - 12);
    }

    for (const item of this.trashItems){
      this.ctx.fillStyle = item.color;
      this.ctx.fillRect(item.x, item.y, item.width, item.height);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(item.symbol, item.x + item.width/2, item.y + item.height/2);
    }

    if (this.mouse.dragging){
      const it = this.mouse.dragging;
      this.ctx.fillStyle = it.color;
      this.ctx.fillRect(it.x, it.y, it.width, it.height);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(it.symbol, it.x + it.width/2, it.y + it.height/2);
    }
    if (this.touch.dragging){
      const it = this.touch.dragging;
      this.ctx.fillStyle = it.color;
      this.ctx.fillRect(it.x, it.y, it.width, it.height);
      this.ctx.fillStyle = 'white';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(it.symbol, it.x + it.width/2, it.y + it.height/2);
    }

    requestAnimationFrame(()=>this.render());
  }

  startGame(){
    if (this.gameState === 'menu' || this.gameState === 'gameover'){
      this.score = 0;
      this.level = 1;
      this.timeLeft = 60;
      this.trashItems = [];
      this.gameState = 'playing';
      document.getElementById('menuScreen').classList.add('hidden');
      document.getElementById('gameOverScreen').classList.add('hidden');
      this.startTimer();
      this.updateUI();
      this.playSound('start');
    }
  }

  togglePause(){
    if (this.gameState === 'playing'){
      this.gameState = 'paused';
      clearInterval(this.gameTimer);
      document.getElementById('pauseButton').textContent = 'Lanjut';
    } else if (this.gameState === 'paused'){
      this.gameState = 'playing';
      this.startTimer();
      document.getElementById('pauseButton').textContent = 'Jeda';
    }
  }

  startTimer(){
    clearInterval(this.gameTimer);
    this.gameTimer = setInterval(()=>{
      this.timeLeft--;
      document.getElementById('timeLeft').textContent = this.timeLeft;
      if (this.timeLeft <= 0) this.endGame();
    },1000);
  }

  endGame(){
    clearInterval(this.gameTimer);
    this.gameState = 'gameover';
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalLevel').textContent = this.level;

    // ✅ tampilkan fun fact random
    const fact = this.funFacts[Math.floor(Math.random() * this.funFacts.length)];
    document.getElementById('funFact').textContent = `💡 Fun Fact: ${fact}`;

    document.getElementById('gameOverScreen').classList.remove('hidden');
    this.saveHighScore();
    this.playSound('gameover');
  }

  restartGame(){
    this.startGame();
  }

  updateUI(){
    document.getElementById('score').textContent = this.score;
    document.getElementById('level').textContent = this.level;
    document.getElementById('timeLeft').textContent = this.timeLeft;
  }

  playSound(type){
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      switch(type){
        case 'correct': osc.frequency.value=523.25; gain.gain.value=0.05; osc.start(); setTimeout(()=>osc.stop(),120); break;
        case 'wrong': osc.frequency.value=196.00; gain.gain.value=0.05; osc.start(); setTimeout(()=>osc.stop(),160); break;
        case 'levelup': osc.frequency.value=783.99; gain.gain.value=0.05; osc.start(); setTimeout(()=>osc.stop(),280); break;
        case 'start': osc.frequency.value=659.25; gain.gain.value=0.05; osc.start(); setTimeout(()=>osc.stop(),220); break;
        case 'gameover': osc.frequency.value=261.63; gain.gain.value=0.05; osc.start(); setTimeout(()=>osc.stop(),600); break;
      }
    }catch(e){ /* ignore audio errors */ }
  }

  saveHighScore(){
    const high = Math.max(this.getHighScore(), this.score);
    localStorage.setItem('trashGameHighScore', high);
    this.updateHighScoreDisplay();
  }
  getHighScore(){ return parseInt(localStorage.getItem('trashGameHighScore') || '0'); }
  loadHighScore(){ this.updateHighScoreDisplay(); }
  updateHighScoreDisplay(){ document.getElementById('highScoreDisplay').textContent = `Skor Tertinggi: ${this.getHighScore()}`; }

  gameLoop(){
    let last = Date.now();
    const loop = ()=>{
      const now = Date.now();
      const dt = (now-last)/1000;
      last = now;
      this.update(dt);
      requestAnimationFrame(loop);
    };
    loop();
  }
}

window.addEventListener('load', ()=>{
  const game = new Game();
  game.gameLoop();
});
