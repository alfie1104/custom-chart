class Chart {
  constructor(container, samples, options, onClick = null) {
    this.samples = samples;

    this.axesLabels = options.axesLabels;
    this.styles = options.styles;
    this.icon = options.icon;
    this.onClick = onClick;

    this.canvas = document.createElement("canvas");
    this.canvas.width = options.size;
    this.canvas.height = options.size;
    this.canvas.style = "background-color:white;";

    container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");

    this.margin = options.size * 0.11;
    this.transparency = options.transparency || 1;

    this.dataTrans = {
      offset: [0, 0],
      scale: 1,
    };

    this.dragInfo = {
      start: [0, 0],
      end: [0, 0],
      offset: [0, 0],
      dragging: false,
    };

    this.hoveredSample = null;
    this.selectedSample = null;

    this.pixelBounds = this.#getPixelBounds();
    this.dataBounds = this.#getDataBounds();
    this.defaultDataBounds = this.#getDataBounds();

    this.#draw();

    this.#addEventListeners();
  }

  #addEventListeners() {
    const { canvas, dataTrans, dragInfo } = this;
    canvas.onmousedown = (e) => {
      //get mouse coordinate
      const dataLoc = this.#getMouse(e, true); //get data coordinate of mouse location
      dragInfo.start = dataLoc;
      dragInfo.dragging = true;
      dragInfo.end = [0, 0];
      dragInfo.offset = [0, 0];
    };

    canvas.onmousemove = (e) => {
      if (dragInfo.dragging) {
        //get mouse coordinate
        const dataLoc = this.#getMouse(e, true); //get data coordinate of mouse location
        dragInfo.end = dataLoc;
        dragInfo.offset = math.scale(
          math.subtract(dragInfo.start, dragInfo.end),
          dataTrans.scale ** 2
        );
        const newOffset = math.add(dataTrans.offset, dragInfo.offset);
        this.#updateDataBounds(newOffset, dataTrans.scale);
      }

      const pLoc = this.#getMouse(e); //get mouse location in pixel space
      const pPoints = this.samples.map((s) =>
        math.remapPoint(this.dataBounds, this.pixelBounds, s.point)
      );

      const index = math.getNearest(pLoc, pPoints); //find the nearest point from mouse point
      const nearest = this.samples[index];
      const dist = math.distance(pPoints[index], pLoc);
      if (dist < this.margin / 2) {
        this.hoveredSample = nearest;
      } else {
        this.hoveredSample = null;
      }

      this.#draw();
    };

    canvas.onmouseup = (e) => {
      dataTrans.offset = math.add(dataTrans.offset, dragInfo.offset);
      dragInfo.dragging = false;
    };

    canvas.onwheel = (e) => {
      const dir = Math.sign(e.deltaY); //-1 (upward) or 1 (down)
      const step = 0.02;
      dataTrans.scale += dir * step;
      //scale값을 step보다 크고 2보다 작도록 한정 시킴
      dataTrans.scale = Math.max(step, Math.min(2, dataTrans.scale));

      this.#updateDataBounds(dataTrans.offset, dataTrans.scale);

      this.#draw();
      e.preventDefault();
    };

    canvas.onclick = () => {
      if (!math.equals(dragInfo.offset, [0, 0])) {
        return;
      }

      if (this.hoveredSample) {
        if (this.selectSample == this.hoveredSample) {
          this.selectedSample = null;
        } else {
          this.selectedSample = this.hoveredSample;
        }
      } else {
        this.selectedSample = null;
      }

      if (this.onClick) {
        this.onClick(this.selectedSample);
      }
      this.#draw();
    };
  }

  #updateDataBounds(offset, scale) {
    const { dataBounds, defaultDataBounds: def } = this;
    dataBounds.left = def.left + offset[0];
    dataBounds.right = def.right + offset[0];
    dataBounds.top = def.top + offset[1];
    dataBounds.bottom = def.bottom + offset[1];

    const center = [
      (dataBounds.left + dataBounds.right) / 2,
      (dataBounds.top + dataBounds.bottom) / 2,
    ];

    dataBounds.left = math.lerp(center[0], dataBounds.left, scale ** 2);
    dataBounds.right = math.lerp(center[0], dataBounds.right, scale ** 2);
    dataBounds.top = math.lerp(center[1], dataBounds.top, scale ** 2);
    dataBounds.bottom = math.lerp(center[1], dataBounds.bottom, scale ** 2);
  }

  #getMouse(e, dataSpace = false) {
    const rect = this.canvas.getBoundingClientRect();
    // e.clientX : X point of the screen
    const pixelLoc = [e.clientX - rect.left, e.clientY - rect.top];

    if (dataSpace) {
      const dataLoc = math.remapPoint(
        this.pixelBounds,
        this.defaultDataBounds,
        pixelLoc
      );
      return dataLoc;
    }

    return pixelLoc;
  }

  #getPixelBounds() {
    const { canvas, margin } = this;
    const bounds = {
      left: margin,
      right: canvas.width - margin,
      top: margin,
      bottom: canvas.height - margin,
    };

    return bounds;
  }

  #getDataBounds() {
    const { samples } = this;
    const x = samples.map((s) => s.point[0]);
    const y = samples.map((s) => s.point[1]);
    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    const minY = Math.min(...y);
    const maxY = Math.max(...y);
    const bounds = {
      left: minX,
      right: maxX,
      top: maxY,
      bottom: minY,
    };
    return bounds;
  }

  #draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.globalAlpha = this.transparency;
    this.#drawSamples(this.samples);
    ctx.globalAlpha = 1;

    if (this.hoveredSample) {
      this.#emphasizeSample(this.hoveredSample);
    }

    if (this.selectedSample) {
      this.#emphasizeSample(this.selectedSample, "yellow");
    }

    this.#drawAxes();
  }

  selectSample(sample) {
    this.selectedSample = sample;
    this.#draw();
  }

  #emphasizeSample(sample, color = "white") {
    const pLoc = math.remapPoint(
      this.dataBounds,
      this.pixelBounds,
      sample.point
    );

    const grd = this.ctx.createRadialGradient(...pLoc, 0, ...pLoc, this.margin);

    grd.addColorStop(0, color);
    grd.addColorStop(1, "rgba(255,255,255,0)");
    graphics.drawPoint(this.ctx, pLoc, grd, this.margin * 2);

    this.#drawSamples([sample]);
  }

  #drawAxes() {
    const { ctx, canvas, axesLabels, margin } = this;
    const { left, right, top, bottom } = this.pixelBounds;

    ctx.clearRect(0, 0, this.canvas.width, margin);
    ctx.clearRect(0, 0, margin, this.canvas.height);
    ctx.clearRect(this.canvas.width - margin, 0, margin, this.canvas.height);
    ctx.clearRect(0, this.canvas.height - margin, this.canvas.width, margin);

    graphics.drawText(ctx, {
      text: axesLabels[0],
      loc: [canvas.width / 2, bottom + margin / 2],
      size: margin * 0.6,
    });

    ctx.save();

    //rotate canvas 90degree based on 0 point of axes
    ctx.translate(left - margin / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    graphics.drawText(ctx, {
      text: axesLabels[1],
      loc: [0, 0],
      size: margin * 0.6,
    });

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.setLineDash([5, 4]); // 5 pixels for dash, 4 pixels for spacing
    ctx.lineWidth = 2;
    ctx.strokeStyle = "lightgray";
    ctx.stroke();
    ctx.setLineDash([]); //set line dash to default value

    //확대/축소 기능을 위해 pixelBounds의 데이터를 dataBounds로 변환 필요
    const dataMin = math.remapPoint(this.pixelBounds, this.dataBounds, [
      left,
      bottom,
    ]);

    //최소 좌표의 data 값(좌표축의 왼쪽 최하단)을 화면에 표시
    graphics.drawText(ctx, {
      text: math.formatNumber(dataMin[0], 2),
      loc: [left, bottom],
      size: margin * 0.3,
      align: "left",
      vAlign: "top",
    });

    ctx.save();
    ctx.translate(left, bottom);
    ctx.rotate(-Math.PI / 2);
    graphics.drawText(ctx, {
      text: math.formatNumber(dataMin[1], 2),
      loc: [0, 0],
      size: margin * 0.3,
      align: "left",
      vAlign: "bottom",
    });

    ctx.restore();

    //확대/축소 기능을 위해 pixelBounds의 데이터를 dataBounds로 변환 필요
    const dataMax = math.remapPoint(this.pixelBounds, this.dataBounds, [
      right,
      top,
    ]);

    //최소 좌표의 data 값(좌표축의 왼쪽 최하단)을 화면에 표시
    graphics.drawText(ctx, {
      text: math.formatNumber(dataMax[0], 2),
      loc: [right, bottom],
      size: margin * 0.3,
      align: "right",
      vAlign: "top",
    });

    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(-Math.PI / 2);
    graphics.drawText(ctx, {
      text: math.formatNumber(dataMax[1], 2),
      loc: [0, 0],
      size: margin * 0.3,
      align: "right",
      vAlign: "bottom",
    });

    ctx.restore();
  }

  #drawSamples(samples) {
    const { ctx, dataBounds, pixelBounds } = this;

    for (const sample of samples) {
      const { point, label } = sample;

      const pixelLoc = math.remapPoint(dataBounds, pixelBounds, point);

      switch (this.icon) {
        case "image":
          graphics.drawImage(ctx, this.styles[label].image, pixelLoc);
          break;
        case "text":
          graphics.drawText(ctx, {
            text: this.styles[label].text,
            loc: pixelLoc,
            size: 20,
          });
          break;
        default:
          graphics.drawPoint(ctx, pixelLoc, this.styles[label].color);
          break;
      }
    }
  }
}
