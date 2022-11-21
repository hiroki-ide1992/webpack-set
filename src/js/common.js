import '../scss/common.scss';

const sleep = (ms) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log(`${ms}秒経ったよ。`);
      resolve('some value1');
    }, 1000);
  });
};

const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('TEST');
    resolve('OK');
  });
});

promise
  .then((e) => {
    sleep(1);
    console.log(e);
  })
  .then(() => sleep(2))
  .then(() => sleep(3));

console.log('end');
