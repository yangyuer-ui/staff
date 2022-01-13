/* eslint-disable @typescript-eslint/no-unused-expressions */
import {GraphicalMusicSheet} from "../../../../src/MusicalScore/Graphical/GraphicalMusicSheet";
import {IXmlElement} from "../../../../src/Common/FileIO/Xml";
import {MusicSheet} from "../../../../src/MusicalScore/MusicSheet";
import {MusicSheetReader} from "../../../../src/MusicalScore/ScoreIO/MusicSheetReader";
import {VexFlowMusicSheetCalculator} from "../../../../src/MusicalScore/Graphical/VexFlow/VexFlowMusicSheetCalculator";
import {TestUtils} from "../../../Util/TestUtils";
import {SourceMeasure} from "../../../../src/MusicalScore/VoiceData/SourceMeasure";
import {SourceStaffEntry} from "../../../../src/MusicalScore/VoiceData/SourceStaffEntry";
import {GraphicalMeasure} from "../../../../src/MusicalScore/Graphical/GraphicalMeasure";
import {MusicSheetCalculator} from "../../../../src/MusicalScore/Graphical/MusicSheetCalculator";
import {EngravingRules} from "../../../../src/MusicalScore/Graphical/EngravingRules";
import { GraphicalStaffEntry } from "../../../../src/MusicalScore/Graphical/GraphicalStaffEntry";
import { VexFlowGraphicalNote } from "../../../../src";

describe("VexFlow Measure", () => {

   it("GraphicalMusicSheet", (done: Mocha.Done) => {
      const path: string = "MuzioClementi_SonatinaOpus36No1_Part1.xml";
      const score: Document = TestUtils.getScore(path);
      chai.expect(score).to.not.be.undefined;
      const partwise: Element = TestUtils.getPartWiseElement(score);
      chai.expect(partwise).to.not.be.undefined;
      const reader: MusicSheetReader = new MusicSheetReader();
      const calc: VexFlowMusicSheetCalculator = new VexFlowMusicSheetCalculator(reader.rules);
      const sheet: MusicSheet = reader.createMusicSheet(new IXmlElement(partwise), path);
      const gms: GraphicalMusicSheet = new GraphicalMusicSheet(sheet, calc);
      // console.log(gms);
      chai.expect(gms).to.not.be.undefined; // at least necessary for linter so that variable is not unused
      done();
   });

   it("Simple Measure", (done: Mocha.Done) => {
      const sheet: MusicSheet = new MusicSheet();
      sheet.Rules = new EngravingRules();
      const measure: SourceMeasure = new SourceMeasure(1, sheet.Rules);
      sheet.addMeasure(measure);
      const calc: MusicSheetCalculator = new VexFlowMusicSheetCalculator(sheet.Rules);
      const gms: GraphicalMusicSheet = new GraphicalMusicSheet(sheet, calc);
      chai.expect(gms.MeasureList.length).to.equal(1);
      chai.expect(gms.MeasureList[0].length).to.equal(1);
      const gm: GraphicalMeasure = gms.MeasureList[0][0];
      // console.log(gm);
      chai.expect(gm).to.not.be.undefined; // at least necessary for linter so that variable is not unused
      done();
   });

   it("Empty Measure", (done: Mocha.Done) => {
      const sheet: MusicSheet = new MusicSheet();
      sheet.Rules = new EngravingRules();
      const measure: SourceMeasure = new SourceMeasure(1, sheet.Rules);
      measure.FirstInstructionsStaffEntries[0] = new SourceStaffEntry(undefined, undefined);
      sheet.addMeasure(measure);
      const calc: MusicSheetCalculator = new VexFlowMusicSheetCalculator(sheet.Rules);
      const gms: GraphicalMusicSheet = new GraphicalMusicSheet(sheet, calc);
      chai.expect(gms.MeasureList.length).to.equal(1);
      chai.expect(gms.MeasureList[0].length).to.equal(1);
      chai.expect(gms.MeasureList[0][0].staffEntries.length).to.equal(0);
      done();
   });

   it("Stem and Beam SVG id", (done: Mocha.Done) => {
      const path: string = "test_rest_positioning_8th_quarter.musicxml";
      // the test sample should simply be one that starts with a beamed 8th note (and is small).
      const score: Document = TestUtils.getScore(path);
      const partwise: Element = TestUtils.getPartWiseElement(score);
      const reader: MusicSheetReader = new MusicSheetReader();
      const calc: VexFlowMusicSheetCalculator = new VexFlowMusicSheetCalculator(reader.rules);
      const sheet: MusicSheet = reader.createMusicSheet(new IXmlElement(partwise), path);
      const gms: GraphicalMusicSheet = new GraphicalMusicSheet(sheet, calc);
      const gse: GraphicalStaffEntry = gms.findGraphicalMeasure(0, 0).staffEntries[0];
      const firstNote: VexFlowGraphicalNote = (gse.graphicalVoiceEntries[0].notes[0] as VexFlowGraphicalNote);
      const noteSVGId: string = firstNote.getSVGId();
      const stemSVGId: string = noteSVGId + "-stem";
      const stemSVG: HTMLElement = document.getElementById(stemSVGId);
      const beamSVGId: string = noteSVGId + "-beam";
      const beamSVG: HTMLElement = document.getElementById(beamSVGId);
      chai.expect(stemSVG).to.not.be.undefined;
      chai.expect(beamSVG).to.not.be.undefined;
      done();
   });

});
