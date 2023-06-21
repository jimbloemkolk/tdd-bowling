function getThrow(max) {
  return Math.floor(Math.random() * (max + 1));
}

function bowlingScore() {
  let scores = []
  for(let frame = 1; frame <= 10; frame++)
  {
    let throw1 = getThrow(10)
    let throw2
    scores.push(throw1)
    if(throw1 != 10) { // not a strike
      throw2 = getThrow( 10 - throw1 ) 
      scores.push(throw2)
    }
    
    // bonus throws:
    if( frame === 10 ) {
      if (throw1 === 10) { // strike
        let bonusBall1 = getThrow(10)
        scores.push(bonusBall1)
        scores.push(bonusBall1 === 10 ? getThrow(10) : getThrow(10-bonusBall1))
      }
      if (throw1 + throw2 === 10) {
        scores.push(getThrow(10))
      }
    }
  }
  return scores
}

const http = require("http");
const port = 8080;

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
  }

const requestListener = function (req, res) {
      let originalGame = bowlingScore()
      console.log(`Sending game: ${JSON.stringify(originalGame)}`)
      let game = originalGame.reverse();

      res.statusCode = 200;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("connection", "keep-alive");
      res.setHeader("Content-Type", "text/event-stream");
  
      const sendNextScore = () => {
        const pins = game.pop();
    
        if (game.length === 0) {
            const data = JSON.stringify({
                state: 'end',
                pins
            });
            res.end(`data: ${data}\n\n`);
            return false;
        } else {
            const data = JSON.stringify({
                state: 'next',
                pins
            });
            res.write(`data: ${data}\n\n`);
            return true;
        }
      };
      const next = () => {
        if (sendNextScore()) {
            const newTimeout = getRandomArbitrary(300, 2000)
            setTimeout(next, newTimeout)
        }
      }

      next()
  };
  
  const server = http.createServer(requestListener);
  server.listen(port, () => {
    console.log(`server running on port ${port}`);
  });