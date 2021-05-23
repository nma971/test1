// using var to work around a WebKit bug
var canvas = document.getElementById('canvas'); // eslint-disable-line

const pxRatio = Math.max(Math.floor(window.devicePixelRatio) || 1, 2);
canvas.width = canvas.clientWidth;
canvas.height = canvas.clientHeight;

const gl = canvas.getContext('webgl', {antialiasing: false});

const wind = window.wind = new WindGL(gl);
wind.numParticles = 8536;

function frame() {
    if (wind.windData) {
        wind.draw();
    }
    requestAnimationFrame(frame);
}
frame();

const gui = new dat.GUI();
//gui.add(wind, 'numParticles', 1024, 589824);
//gui.add(wind, 'fadeOpacity', 0.96, 0.999).step(0.001).updateDisplay();
//gui.add(wind, 'speedFactor', 0.05, 1.0);
//gui.add(wind, 'dropRate', 0, 0.1);
//gui.add(wind, 'dropRateBump', 0, 0.2);

const windFiles = {
    0: '20210523T00',
    6: '20210523T06',
    12: '20210523T12',
    18: '20210523T18',
    24: '20210524T00',
    30: '20210524T06',
    36: '20210524T12',
    42: '20210524T18',
    48: '20210525T21'
};

const meta = {
    '2021-05-23+h': 0,
    'retina resolution': true,
    'NMA wind forecast (MOSDAC)': function () {
        window.location = 'NMA wind forecast (MOSDAC)';
    }
};
gui.add(meta, '2021-05-23+h', 0, 48, 6).onFinishChange(updateWind);
if (pxRatio !== 1) {
    gui.add(meta, 'retina resolution').onFinishChange(updateRetina);
}
gui.add(meta, 'NMA wind forecast (MOSDAC)');
updateWind(0);
updateRetina();

function updateRetina() {
    const ratio = meta['retina resolution'] ? pxRatio : 1;
    canvas.width = canvas.clientWidth * ratio;
    canvas.height = canvas.clientHeight * ratio;
    wind.resize();
}

getJSON('mosdac.geojson', function (data) {
    const canvas = document.getElementById('coastline');
    canvas.width = canvas.clientWidth * pxRatio;
    canvas.height = canvas.clientHeight * pxRatio;

    const ctx = canvas.getContext('2d');
    ctx.lineWidth = pxRatio;
    ctx.lineJoin = ctx.lineCap = 'round';
    ctx.strokeStyle = 'white';
    ctx.beginPath();

    for (let i = 0; i < data.features.length; i++) {
        const line = data.features[i].geometry.coordinates;
        for (let j = 0; j < line.length; j++) {
            ctx[j ? 'lineTo' : 'moveTo'](
                (line[j][0]-63.5)*canvas.width/38,
                (-line[j][1]+34)*canvas.height/29);
        }
    }
    ctx.stroke();
});

function updateWind(name) {
    getJSON('wind/' + windFiles[name] + '.json', function (windData) {
        const windImage = new Image();
        windData.image = windImage;
        windImage.src = 'wind/' + windFiles[name] + '.png';
        windImage.onload = function () {
            wind.setWind(windData);
        };
    });
}

function getJSON(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open('get', url, true);
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            callback(xhr.response);
        } else {
            throw new Error(xhr.statusText);
        }
    };
    xhr.send();
}
