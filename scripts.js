const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVid() {
    navigator.mediaDevices.getUserMedia({video: true, audio: false})
    .then(localMediaStream => {
        console.log(localMediaStream);
        video.srcObject = localMediaStream;
        video.play();
    })
    .catch(err => {
        console.error(`No! `, err);
    }); 


}

function paintToCanvas(){
    const width = video.videoWidth;
    const height = video.videoHeight;
    canvas.width = width;
    canvas.height = height;

    return setInterval(() => {
        ctx.drawImage(video, 0, 0, width, height);
        let pixels = ctx.getImageData(0, 0, width, height);
        
        //apply effect
        //pixels = redEffect(pixels);
        //pixels = rgbSplit(pixels);

        pixels = greenScreen(pixels);
        //put pixels again
        ctx.putImageData(pixels, 0, 0);
    }, 16);
}

let count = 0;
function takePhoto(){
    //sound
    snap.currentTime = 0;
    snap.play();

    //take data from canvas
    const data = canvas.toDataURL("image/jpeg");

    //create 
    const link = document.createElement("a");
    link.href = data;
    link.setAttribute("download", `photo ${count}`);
    link.innerHTML = `<img src="${data}" alt="photo ${count}">`;
    strip.insertBefore(link, strip.firstChild);
    count++;
}

function redEffect(pixels){
    for(let i = 0; i < pixels.data.length; i+=4){
        pixels.data[i] = pixels.data[i] + 150; //R
        //pixels.data[i+1] = pixels.data[i+1] - 50; //G
        //pixels.data[i+2] = pixels.data[i+2] * 30; //B
    }
    return pixels;
}

function rgbSplit(pixels){
    for(let i = 0; i < pixels.data.length; i+=4){
        pixels.data[i - 150] = pixels.data[i];
        pixels.data[i + 150] = pixels.data[i+1];
        pixels.data[i + 100] = pixels.data[i+2];
    }
    return pixels;
}

function greenScreen(pixels){
    const levels = {};

    document.querySelectorAll('.rgb input').forEach((input) => {
        levels[input.name] = input.value;
    });

    for (i = 0; i < pixels.data.length; i = i + 4) {
        red = pixels.data[i + 0];
        green = pixels.data[i + 1];
        blue = pixels.data[i + 2];
        alpha = pixels.data[i + 3];

        if (red >= levels.rmin
        && green >= levels.gmin
        && blue >= levels.bmin
        && red <= levels.rmax
        && green <= levels.gmax
        && blue <= levels.bmax) {
        // take it out!
        pixels.data[i + 3] = 0;
        }
    }

    return pixels;
}

getVid();

//as soon as video can play, paint canvas with it
video.addEventListener('canplay', paintToCanvas);