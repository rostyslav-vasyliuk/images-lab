/* eslint-disable */
import './App.css';
import { useEffect, useState, useRef } from 'react';
import { Button, Switch, Typography } from 'antd';
import { FileImageTwoTone, UploadOutlined, EditOutlined } from '@ant-design/icons';
import { Slider, Card } from 'antd';

function App() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [delta, setDelta] = useState(20);
  const [showMatch, setShowMatch] = useState(true);
  const [showMatchAllColors, setShowMatchAllColors] = useState(false);
  const [showImage1, setShowImage1] = useState(false);
  const [showImage2, setShowImage2] = useState(false);
  const [isResultDrawed, setIsResultDrawedd] = useState(false);
  const inputFile1 = useRef(null);
  const inputFile2 = useRef(null);
  const [pixelInfo, setPixelInfo] = useState({});

  useEffect(() => {
    console.log('mount');
    document.getElementById('canvas1').style.display = 'none';
    document.getElementById('canvas2').style.display = 'none';
    document.getElementById('canvas3').style.display = 'none';
    document.getElementById('canvas3').addEventListener('mousemove', onMouseMove);

    return () => {

    };
  }, []);

  const onMouseMove = (e) => {
    const canvas = document.getElementById('canvas3');
    var pos = getPosition(document.getElementById('canvas3'));
    var x = e.pageX - pos.x;
    var y = e.pageY - pos.y;
    var c = canvas.getContext('2d');
    var p = c.getImageData(x, y, 1, 1).data;

    const rgba1 = document.getElementById('canvas1').getContext('2d')?.getImageData(x, y, 1, 1)?.data;
    const rgba2 = document.getElementById('canvas2').getContext('2d')?.getImageData(x, y, 1, 1)?.data;
    const info = {
      x,
      y,
      p,
      rgba1,
      rgba2,
    };

    setPixelInfo(info);
  }

  const onControllersChange = (val, id) => {
    setShowMatch(false);
    setShowMatchAllColors(false);
    setShowImage1(false);
    setShowImage2(false);

    if (id === 'match') {
      setShowMatch(val);
    }

    if (id === 'matchAll') {
      setShowMatchAllColors(val);
    }

    if (id === 'image1') {
      setShowImage1(val);
    }

    if (id === 'image2') {
      setShowImage2(val);
    }
  }

  const onFileInputChange = (e, canvasId) => {
    var img = new Image();
    img.src = URL.createObjectURL(e.target.files[0]);
    document.getElementById(canvasId).style.display = 'block';
    img.onload = () => onDraw(img, canvasId);

    if (canvasId === 'canvas1') {
      setImage1(img);
    } else {
      setImage2(img);
    }
    console.log(e.target.files[0]);
  }

  const onDraw = (img, canvasId) => {
    var canvas = document.getElementById(canvasId);
    var ctx = canvas.getContext('2d');

    var MAX_WIDTH = 400;
    var MAX_HEIGHT = 400;
    var width = img.width;
    var height = img.height;

    // Add the resizing logic
    if (width > height) {
      if (width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
      }
    } else {
      if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
  }

  const drawResult = () => {
    const canvas1 = document.getElementById('canvas1');
    const ctx1 = canvas1.getContext('2d');
    const rgbArray1 = ctx1.getImageData(0, 0, canvas1.width, canvas1.height).data;
    console.log(rgbArray1);

    const canvas2 = document.getElementById('canvas2');
    const ctx2 = canvas2.getContext('2d');
    const rgbArray2 = ctx2.getImageData(0, 0, canvas2.width, canvas2.height).data;
    console.log(rgbArray2);

    const height = canvas1.height > canvas2.height ? canvas1.height : canvas2.height;
    const width = canvas1.width > canvas2.width ? canvas1.width : canvas2.width;
    const length = rgbArray1.length > rgbArray2.length ? rgbArray1.length : rgbArray2.length;

    const rgbData = new Uint8ClampedArray(height * width * 4);

    for (let i = 0; i < length; i += 4) {
      const rValueDiff = rgbArray1[i] > rgbArray2[i] ? rgbArray1[i] - rgbArray2[i] : rgbArray2[i] - rgbArray1[i];

      if (showMatch) {
        if (rValueDiff <= delta) {
          rgbData[i] = (rgbArray1[i] + rgbArray2[i]) / 2;
        } else {
          rgbData[i] = 0;
        }
        rgbData[i + 1] = 0;
        rgbData[i + 2] = 0;
        rgbData[i + 3] = 255;
      }

      if (showMatchAllColors) {
        if (rValueDiff <= delta) {
          rgbData[i] = (rgbArray1[i] + rgbArray2[i]) / 2;
          rgbData[i + 1] = (rgbArray1[i + 1] + rgbArray2[i + 1]) / 2;
          rgbData[i + 2] = (rgbArray1[i + 2] + rgbArray2[i + 2]) / 2;
          rgbData[i + 3] = (rgbArray1[i + 3] + rgbArray2[i + 3]) / 2;
        } else {
          rgbData[i] = 0;
          rgbData[i + 1] = 0;
          rgbData[i + 2] = 0;
          rgbData[i + 3] = 255;
        }
      }

      if (showImage1) {
        if (rValueDiff <= delta) {
          rgbData[i] = rgbArray1[i];
          rgbData[i + 1] = rgbArray1[i + 1];
          rgbData[i + 2] = rgbArray1[i + 2];
          rgbData[i + 3] = rgbArray1[i + 3];
        }
      }

      if (showImage2) {
        if (rValueDiff <= delta) {
          rgbData[i] = rgbArray2[i];
          rgbData[i + 1] = rgbArray2[i + 1];
          rgbData[i + 2] = rgbArray2[i + 2];
          rgbData[i + 3] = rgbArray2[i + 3];
        }
      }
    }
    setIsResultDrawedd(true);
    document.getElementById('canvas3').style.display = 'block';
    const canvas3 = document.getElementById('canvas3');
    canvas3.height = height;
    canvas3.width = width;
    const ctx3 = canvas3.getContext('2d');
    ctx3.clearRect(0, 0, canvas3.width, canvas3.height);
    const imageData = new ImageData(rgbData, width, height);
    ctx3.putImageData(imageData, 0, 0)
  }

  const getPosition = (obj) => {
    var curleft = 0, curtop = 0;
    if (obj.offsetParent) {
      do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
      } while (obj = obj.offsetParent);
      return { x: curleft, y: curtop };
    }
    return undefined;
  }

  return (
    <div>
      <Card size="small" title="Інструкція до виконання" style={{ width: '80%', margin: '25px auto' }}>
        <div className={'instr-block'}>
          1. Завантажте "Зображення 1" та "Зображення 2" у якості джерела даних для знаходження спільних пікселів по значенню R (за RGB) із відхиленням "Дельта".
        </div>
        <div className={'instr-block'}>
          2. Оберіть налаштування виводу результату. Доступні опції дозволяють змінити значення "Дельта", показати збіг двох зображень по R згідно "Дельта", та показати точки із 1 та 2 зображень, які задовольняють умову збігу.
        </div>
        <div className={'instr-block'}>
          3. Натисніть кнопку "Намалювати".
        </div>
        <div className={'instr-block'}>
          4. Для перегляду значення пікселя результуючого зображення наведіть мишкою на цей піксель.
        </div>
      </Card>
      <div className="cols">
        <div className={'col'}>
          <input
            type='file'
            onChange={(e) => onFileInputChange(e, 'canvas1')}
            style={{ display: 'none' }}
            ref={inputFile1}
          />
          <Typography.Text style={{ margin: '10px', fontWeight: '500' }}>
            Зображення 1
          </Typography.Text>
          <div className={'canvas-wrapper'}>
            {!image1 && (
              <div className={'no-image'}>
                <FileImageTwoTone style={{ fontSize: '50px' }} />
                <span className={'no-image-text'}>
                  Завантажте зображення 1 за допомогою кнопки нижче
              </span>
              </div>
            )}
            <canvas id={'canvas1'} />
          </div>
          <div className={'btn-wrapper'}>
            <Button
              onClick={() => inputFile1.current.click()}
              type="primary"
              icon={<UploadOutlined />}
              className={'upload-button'}
            >
              {'Завантажити зображення 1'}
            </Button>
          </div>
        </div>

        <div className={'col'}>
          <input
            type='file'
            onChange={(e) => onFileInputChange(e, 'canvas2')}
            style={{ display: 'none' }}
            ref={inputFile2}
          />
          <Typography.Text style={{ margin: '10px', fontWeight: '500' }}>
            Зображення 2
          </Typography.Text>
          <div className={'canvas-wrapper'}>
            {!image2 && (
              <div className={'no-image'}>
                <FileImageTwoTone style={{ fontSize: '50px' }} />
                <span className={'no-image-text'}>
                  Завантажте зображення 2 за допомогою кнопки нижче
              </span>
              </div>
            )}
            <canvas id={'canvas2'} />
          </div>
          <div className={'btn-wrapper'}>
            <Button
              onClick={() => inputFile2.current.click()}
              type="primary"
              icon={<UploadOutlined />}
              className={'upload-button'}
            >
              {'Завантажити зображення 2'}
            </Button>
          </div>
        </div>
      </div>

      <div className={'result-zone'}>
        <div>
          <div className={'canvas-wrapper'}>
            {!isResultDrawed && (
              <div className={'no-image'}>
                <FileImageTwoTone style={{ fontSize: '50px' }} />
                <span className={'no-image-text'}>
                  Завантажте два зображення вище та натисніть кнопку "Намалювати" для генерації результуючого зображення
              </span>
              </div>
            )}
            <canvas id={'canvas3'} />
            <div>
            </div>
          </div>

          <div style={{ marginTop: '20px', height: '150px', width: '400px' }}>
            <Card style={{ height: '150px' }}>
              {!pixelInfo.x && (
                <div className={'no-image'}>
                  <FileImageTwoTone style={{ fontSize: '50px' }} />
                  <span className={'no-image-text'}>
                    Тут відображатимуться дані про піксель після генерації результуючого зображення
                  </span>
                </div>
              )}

              {pixelInfo.x && (
                <div className={'pixel-info'}>
                  <div>
                    x = {pixelInfo.x}, y = {pixelInfo.y}, delta = {delta}
                  </div>
                  <div>
                    RGBA Результуючого = [{pixelInfo.p[0]}, {pixelInfo.p[1]}, {pixelInfo.p[2]}, {(pixelInfo.p[3] / 255).toFixed(2)}]
                </div>
                  <div>
                    RGBA Зображення 1 = [{pixelInfo.rgba1[0]}, {pixelInfo.rgba1[1]}, {pixelInfo.rgba1[2]}, {(pixelInfo.rgba1[3] / 255).toFixed(2)}]
                </div>
                  <div>
                    RGBA Зображення 2 = [{pixelInfo.rgba2[0]}, {pixelInfo.rgba2[1]}, {pixelInfo.rgba2[2]}, {(pixelInfo.rgba2[3] / 255).toFixed(2)}]
                </div>
                </div>
              )}
            </Card>
          </div>
        </div>

        <Card style={{ height: '400px' }}>
          <div className={'controllers'}>
            <div>
              Дельта значення для R (по RGB):
            <div className={'slider-wrp'}>
                <span>0</span>
                <Slider
                  step={1}
                  min={0}
                  max={255}
                  defaultValue={delta}
                  onAfterChange={setDelta}
                  style={{ width: '200px' }}
                // tooltipVisible
                />
                <span>255</span>
              </div>
            </div>

            <div className={'switch-wrapper'}>
              <Switch checked={showMatch} onChange={(val) => onControllersChange(val, 'match')} />
              <span className={'switch-label'}>
                Показати збіг обох по R (результат - середня R, G = 0, B = 0)
              </span>
            </div>

            <div className={'switch-wrapper'}>
              <Switch checked={showMatchAllColors} onChange={(val) => onControllersChange(val, 'matchAll')} />
              <span className={'switch-label'}>
                Показати збіг обох по R (результат - середня R, G, B)
              </span>
            </div>

            <div className={'switch-wrapper'}>
              <Switch checked={showImage1} onChange={(val) => onControllersChange(val, 'image1')} />
              <span className={'switch-label'}>
                Показати точки збігу зображення 1
              </span>
            </div>

            <div className={'switch-wrapper'}>
              <Switch checked={showImage2} onChange={(val) => onControllersChange(val, 'image2')} />
              <span className={'switch-label'}>
                Показати точки збігу зображення 2
              </span>
            </div>
            <Button
              type="primary"
              className={'drawBtn'}
              onClick={drawResult}
              disabled={!(image1 && image2)}
              icon={<EditOutlined />}
            >
              {'Намалювати'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;
