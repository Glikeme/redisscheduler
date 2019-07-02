const [, , seconds = 30] = process.argv;
const date = new Date();
date.setSeconds(date.getSeconds() + seconds);
console.log(+date);
