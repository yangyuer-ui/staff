// [VexFlow](http://vexflow.com) - Copyright (c) Mohit Muthanna 2010.
// Author Larry Kuhns 2011

import { StaveModifier } from './stavemodifier';
import { Glyph } from './glyph';

export class Repetition extends StaveModifier {
  static get CATEGORY() { return 'repetitions'; }
  static get type() {
    return {
      NONE: 1,         // no coda or segno
      CODA_LEFT: 2,    // coda at beginning of stave
      CODA_RIGHT: 3,   // coda at end of stave
      SEGNO_LEFT: 4,   // segno at beginning of stave
      SEGNO_RIGHT: 5,  // segno at end of stave
      DC: 6,           // D.C. at end of stave
      DC_AL_CODA: 7,   // D.C. al coda at end of stave
      DC_AL_FINE: 8,   // D.C. al Fine end of stave
      DS: 9,           // D.S. at end of stave
      DS_AL_CODA: 10,  // D.S. al coda at end of stave
      DS_AL_FINE: 11,  // D.S. al Fine at end of stave
      FINE: 12,        // Fine at end of stave
      TO_CODA: 13,     // To Coda at end of stave
    };
  }

  constructor(type, x, y_shift) {
    super();
    this.setAttribute('type', 'Repetition');

    this.symbol_type = type;
    this.x = x;
    this.x_shift = 0;
    this.y_shift = y_shift;
    this.font = {
      family: 'times',
      size: 12,
      weight: 'bold italic',
    };
  }

  getCategory() { return Repetition.CATEGORY; }
  setShiftX(x) { this.x_shift = x; return this; }
  setShiftY(y) { this.y_shift = y; return this; }

  setX(x) { 
    this.x = x; return this;
  }

  draw(stave, x) {
    this.setRendered();

    switch (this.symbol_type) {
      case Repetition.type.CODA_RIGHT:
        this.drawCodaFixed(stave, x + stave.width);
        break;
      case Repetition.type.CODA_LEFT:
        this.drawSymbolText(stave, x, 'Coda', true);
        break;
      case Repetition.type.SEGNO_LEFT:
        this.drawSignoFixed(stave, x);
        break;
      case Repetition.type.SEGNO_RIGHT:
        this.drawSignoFixed(stave, x + stave.width);
        break;
      case Repetition.type.DC:
        this.drawSymbolText(stave, x, 'D.C.', false);
        break;
      case Repetition.type.DC_AL_CODA:
        this.drawSymbolText(stave, x, 'D.C. al', true);
        break;
      case Repetition.type.DC_AL_FINE:
        this.drawSymbolText(stave, x, 'D.C. al Fine', false);
        break;
      case Repetition.type.DS:
        this.drawSymbolText(stave, x, 'D.S.', false);
        break;
      case Repetition.type.DS_AL_CODA:
        this.drawSymbolText(stave, x, 'D.S. al', true);
        break;
      case Repetition.type.DS_AL_FINE:
        this.drawSymbolText(stave, x, 'D.S. al Fine', false);
        break;
      case Repetition.type.FINE:
        this.drawSymbolText(stave, x, 'Fine', false);
        break;
      // VexFlowPatch: added TO_CODA type, handling
      case Repetition.type.TO_CODA:
        this.drawSymbolText(stave, x, 'To', true);
        break;
      default:
        break;
    }

    return this;
  }

  drawCodaFixed(stave, x) {
    const y = stave.getYForTopText(stave.options.num_lines) + this.y_shift;
    Glyph.renderGlyph(stave.context, this.x + x + this.x_shift, y + 25, 40, 'v4d', true);
    return this;
  }

  drawSignoFixed(stave, x) {
    const y = stave.getYForTopText(stave.options.num_lines) + this.y_shift;
    Glyph.renderGlyph(stave.context, this.x + x + this.x_shift, y + 25, 30, 'v8c', true);
    return this;
  }

  drawSymbolText(stave, x, text, draw_coda) {
    const ctx = stave.checkContext();

    ctx.save();
    ctx.setFont(this.font.family, this.font.size, this.font.weight);
    // Default to right symbol
    let text_x = 0 + this.x_shift;
    let symbol_x = x + this.x_shift;
    if (this.symbol_type === Repetition.type.CODA_LEFT) {
      // Offset Coda text to right of stave beginning
      // text_x = this.x + stave.options.vertical_bar_width;
      text_x = this.x + this.x_shift;
      symbol_x = text_x + ctx.measureText(text).width + 12;
    } else {
      // VexFlowPatch: fix placement, like for DS_AL_CODA
      this.x_shift = -(text_x + ctx.measureText(text).width + 12 + stave.options.vertical_bar_width + 12);
      // TO_CODA and DS_AL_CODA draw in the next measure without this x_shift, not sure why not for other symbols.
      text_x = this.x + this.x_shift + stave.options.vertical_bar_width;
      symbol_x = text_x + ctx.measureText(text).width + 12;
    }
    if (this.xShiftAsPercentOfStaveWidth) {
      const extraShiftX = stave.width * this.xShiftAsPercentOfStaveWidth;
      if (
        this.symbol_type === Repetition.type.DC_AL_FINE ||
        this.symbol_type === Repetition.type.FINE ||
        this.symbol_type === Repetition.type.DC ||
        this.symbol_type === Repetition.type.DS_AL_FINE ||
        this.symbol_type === Repetition.type.DS ||
        this.symbol_type === Repetition.type.FINE
      ) {
        text_x += extraShiftX;
      }
      // else if (
      //   this.symbol_type === Repetition.type.DS_AL_CODA ||
      //   this.symbol_type === Repetition.type.DC_AL_CODA ||
      //   this.symbol_type === Repetition.type.TO_CODA
      // ) {
      //   // somehow DS_AL_CODA is already further right by default
      //   //   TODO can cause collisions
      //   text_x += extraShiftX * 0.4;
      //   symbol_x += extraShiftX * 0.4;
      // }
    }
    // earlier, we applied this to most elements individually, not necessary:
    // } else if (this.symbol_type === Repetition.type.TO_CODA) {
    //   // text_x = x + this.x + this.x_shift + stave.options.vertical_bar_width;
    //   // symbol_x = text_x + ctx.measureText(text).width + 12;

    //   // VexFlowPatch: fix placement, like for DS_AL_CODA
    //   this.x_shift = -(text_x + ctx.measureText(text).width + 12 + stave.options.vertical_bar_width + 12);
    //   // TO_CODA and DS_AL_CODA draw in the next measure without this x_shift, not sure why not for other symbols.
    //   text_x = this.x + this.x_shift + stave.options.vertical_bar_width;
    //   symbol_x = text_x + ctx.measureText(text).width + 12;
    // } else if (this.symbol_type === Repetition.type.DS_AL_CODA) {
    //   this.x_shift = -(text_x + ctx.measureText(text).width + 12 + stave.options.vertical_bar_width + 12);
    //   // TO_CODA and DS_AL_CODA draw in the next measure without this x_shift, not sure why not for other symbols.
    //   text_x = this.x + this.x_shift + stave.options.vertical_bar_width;
    //   symbol_x = text_x + ctx.measureText(text).width + 12;
    // } else {
    //   // Offset Signo text to left stave end
    //   symbol_x = this.x + x + stave.width - 5 + this.x_shift;
    //   text_x = symbol_x - + ctx.measureText(text).width - 12;
    // }

    const y = stave.getYForTopText(stave.options.num_lines) + this.y_shift + 25;
    if (draw_coda) {
      Glyph.renderGlyph(ctx, symbol_x, y, 40, 'v4d', true);
    }

    ctx.fillText(text, text_x, y + 5);
    ctx.restore();

    return this;
  }
}
