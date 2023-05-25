// see https://www.w3.org/TR/WCAG20/#contrast-ratiodef for the reference.

/// Returns the relative luminance for a given color
/// Parameters: r, g and b (both Int between 0 and 255)
exports.getLuminance = function (r, g, b) {
  // console.log("qq",r, g,b)
  r /= 255;
  g /= 255;
  b /= 255;
  let red = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  let green = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  let blue = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  // Compute and return luminance
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
};

exports.getContrastRatio = function (c1, c2) {
  // console.log(c1,c2)
  const [r, g, b] = [c1[0], c1[1], c1[2]];
  const [r1, g1, b1] = [c2[0], c2[1], c2[2]];
  const colorObj1 = { r, g, b };
  const colorObj2 = { r1, g1, b1 };
  // const rgbArray = c1.map((r, index) => {
  //   return {
  //     r,
  //     g: c2[index],
  //     b: c2[index]
  //   };
  // });
  // console.log(colorObj1)
  // console.log(colorObj2)
  
  let l1 = this.getLuminance(colorObj1.r,colorObj1.g,colorObj1.b);
  let l2 = this.getLuminance(colorObj2.r1,colorObj2.g1,colorObj2.b1);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

exports.minContrastRatio = 7.1; // 7:1, constant

exports.checkContrast = function (c1, c2) {
  return this.getContrastRatio(c1, c2) >= this.minContrastRatio;
};

// isLevelAA : function(colorA, colorB, fontSize) {
//   var result = this.check(colorA, colorB, fontSize);
//   return result.WCAG_AA;
// },
// isLevelAAA : function(colorA, colorB, fontSize) {
//   var result = this.check(colorA, colorB, fontSize);
//   return result.WCAG_AAA;
// },

exports.verifyContrastRatio = function (ratio, fontSize) {
  const resultsClass = {
    toString: function () {
      return (
        "< WCAG-AA: " +
        (this.WCAG_AA ? "pass" : "fail") +
        " WCAG-AAA: " +
        (this.WCAG_AAA ? "pass" : "fail") +
        " >"
      );
    },
  };
  const WCAG_REQ_RATIO_AA_LG = 3.0,
    WCAG_REQ_RATIO_AA_SM = 4.5,
    WCAG_REQ_RATIO_AAA_LG = 4.5,
    WCAG_REQ_RATIO_AAA_SM = 7.0,
    WCAG_FONT_CUTOFF = 18;

  const results = Object.create(resultsClass);

  if (fontSize >= WCAG_FONT_CUTOFF) {
    results.WCAG_AA = ratio >= WCAG_REQ_RATIO_AA_LG;
    results.WCAG_AAA = ratio >= WCAG_REQ_RATIO_AAA_LG;
  } else {
    results.WCAG_AA = ratio >= WCAG_REQ_RATIO_AA_SM;
    results.WCAG_AAA = ratio >= WCAG_REQ_RATIO_AAA_SM;
  }

  return results;
};
exports.componentToHex = function(c) {
  console.log(c.r)
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

// exports.rgbToHex=function(r, g, b) {
//   console.log("hii",r,g,b)
//   return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
// }

exports.rgbToHex =function(x) {
  // console.log(x)
  const [r, g, b] = [x[0], x[1], x[2]];
  const colorObj1 = { r, g, b };
  // console.log("clr",colorObj1)
  var hex = "#" + ((1 << 24) + (colorObj1.r << 16) + (colorObj1.g << 8) + colorObj1.b).toString(16).slice(1);
  // console.log(hex)
  return hex;
}
// (exports.level = function (c1, c2) {
//   var contrastRatio = this.getContrastRatio(c1, c2);
//   if (contrastRatio >= 7.1) {
//     return "AAA";
//   }
//   return contrastRatio >= 4.5 ? "AA" : "";
// });
exports.hexToRgb =function(hex){
  // Remove the # symbol if present
  const hexcolor=[]
  // console.log("mm",hex)
  hex = hex.replace("#", "");

  // Parse the hexadecimal components
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Return the RGB values as an object
  hexcolor.push(r,g,b)
  // console.log(hexcolor)
  return hexcolor;
}
