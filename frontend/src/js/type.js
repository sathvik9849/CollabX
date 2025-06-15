import { getUserInfo } from "../localStorage.js";

const adjectives = [
  'small',
  'big',
  'large',
  'smelly',
  'new',
  'happy',
  'shiny',
  'old',
  'clean',
  'nice',
  'bad',
  'cool',
  'hot',
  'cold',
  'warm',
  'hungry',
  'slow',
  'fast',
  'red',
  'white',
  'black',
  'blue',
  'green',
  'basic',
  'strong',
  'cute',
  'poor',
  'nice',
  'huge',
  'rare',
  'lucky',
  'weak',
  'tall',
  'short',
  'tiny',
  'great',
  'long',
  'single',
  'rich',
  'young',
  'dirty',
  'fresh',
  'brown',
  'dark',
  'crazy',
  'sad',
  'loud',
  'brave',
  'calm',
  'silly',
  'smart',
];

const nouns = [
  'dog',
  'bat',
  'wrench',
  'apple',
  'pear',
  'ghost',
  'cat',
  'wolf',
  'squid',
  'goat',
  'snail',
  'hat',
  'sock',
  'plum',
  'bear',
  'snake',
  'turtle',
  'horse',
  'spoon',
  'fork',
  'spider',
  'tree',
  'chair',
  'table',
  'couch',
  'towel',
  'panda',
  'bread',
  'grape',
  'cake',
  'brick',
  'rat',
  'mouse',
  'bird',
  'oven',
  'phone',
  'photo',
  'frog',
  'bear',
  'camel',
  'sheep',
  'shark',
  'tiger',
  'zebra',
  'duck',
  'eagle',
  'fish',
  'kitten',
  'lobster',
  'monkey',
  'owl',
  'puppy',
  'pig',
  'rabbit',
  'fox',
  'whale',
  'beaver',
  'gorilla',
  'lizard',
  'parrot',
  'sloth',
  'swan',
];

const getRandomNumber = (length) => {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Typing Effect
let adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
let noun = nouns[Math.floor(Math.random() * nouns.length)];
const num = getRandomNumber(5);
noun = noun.charAt(0).toUpperCase() + noun.substring(1);
adjective = adjective.charAt(0).toUpperCase() + adjective.substring(1);
let i = 0;
let txt = num + adjective + noun;
if (getUserInfo().email.split('@')[0] !== '') {
  txt = getUserInfo().email.split('@')[0].replace(/[0-9]/g, '').substring(0,8);
}
const speed = 60;

export const typeWriter = () => {
  if (i < txt.length) {
    document.getElementById('user_login').value += txt.charAt(i);
    i += 1;
    setTimeout(typeWriter, speed);
  }
}