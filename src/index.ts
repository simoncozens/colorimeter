import $ from "jquery";
import Chart from "chart.js/auto";
import regression from "regression";

const TEXT = `The spectacle before us was indeed sublime. The sky of a deep dark blue was hung with innumerable stars, which seemed to float in the limpid ether, and the rolling vapours through which we had passed were drawn like a sable curtain between us and the lower world. The stillness was so profound that we could hear the beating of our own hearts. "How beautiful!" exclaimed Miss Carmichael, in a solemn whisper, as if she were afraid that angels might hear. "There is Venus right ahead," cried the astronomer, but in a softer tone than usual, perhaps out of respect for the sovereign laws of the universe. "The course is clear now--we are fairly on the open sea--I mean the open ether. I must get out my telescope." "The sky does not look sad here, as it always does on the earth--to me at least," whispered Miss Carmichael, after Gazen had left us alone. "I suppose that is because there is so much sadness around us and within us there." "The atmosphere, too, is often very impure," I replied, also in a whisper. "Up here I enjoy a sense of absolute peace and well-being, if not happiness," she murmured. "I feel raised above all the miseries of life--they appear to me so paltry and so vain." "As when we reach a higher moral elevation," said I, drifting into a confidential mood, like passengers on the deck of a ship, under the mysterious glamour of the night-sky. "Such moments are too rare in life. Do you remember the lines of Shakespeare:-- "'Look, how the floor of heaven Is thick inlaid with patines of bright gold: There's not the smallest orb which thou behold'st, But in his motion like an angel sings, Still quiring to the young-eyed cherubims: Such harmony is in immortal souls; But whilst this muddy vesture of decay Doth grossly close it in--we cannot hear it.'" "True," responded Miss Carmichael, "and now I begin to feel like a disembodied spirit--a 'young-eyed cherubim.' I seem to belong already to a better planet. Should you not like to dwell here for ever, far away from the carking cares and troubles of the world?" The unwonted sadness of her tone reminded me of her devoted life, and I turned towards her with new interest and sympathy. She was looking at the Evening Star, whose bright beam softened the irregularities of her profile, and made her almost beautiful. "Yes," I answered, and the words "with you" formed themselves in my heart. I know not what folly I might have spoken had not the conversation been interrupted by Gazen, who called out in his unromantic style, "I say, Miss Carmichael! Won't you come and take a look at Venus?" She rose at once, and I followed her to the observatory. The telescope was very powerful for its size, and showed the dusky night side of the planet against the brilliant crescent of the day like the "new moon in the arms of the old," or, as Miss Carmichael said, "like an amethyst in a silver clasp." "Really, it is not unlike that," said Gazen, pleased with her feminine conceit. "If the instrument were stronger you would probably see the clasp go all round the dusky violet body like a bright ring, and probably, too, an ashen light within it, such as we see on the dark side of the moon. By-and-by, as we get nearer, we shall study the markings of the terminator, and a shallow notch that is just visible on the inner edge of the southern horn. Can you see it?" "Yes, I think I can. What is it?" replied Miss Carmichael. "Probably a vast crater, or else a range of high mountains intercepting the sunlight, and making a scallop in the border of the terminator. However, that is a secret for us to find out. We know very little of the planet Venus--not even the length of her day. Some think it is eight months long, others twenty-four hours. We shall see. I have begun to keep a record of our discoveries, and some day--when I return to town--I hope to read a paper on the subject before the most potent, grave, and learned Fellows of the Royal Astronomical Society--I rather think I shall surprise them--I do not say startle--it is impossible to startle the Fellows of the Royal Astronomical Society--or even to astonish them--you might as well hope to tickle the Sphinx--but I fancy it will stir them up a little, especially my friend Professor Sylvanus Pettifer Possil. However, I must take care not to give them the slightest hint of what they are to expect beforehand, otherwise they will declare they knew all about it already." "Has it struck you that up here the stars appear of different colours at various distances," said Miss Carmichael. "Oh, yes," answered Gazen, "and in the pure atmosphere of the desert, or on the summit of high mountains, we notice a similar effect. The stars have been compared to the trees of a forest, in different stages of growth and decay. Some of them are growing in splendour, and others again are dying out. Arcturus, a red star, for example, is fast cooling to a cinder. Capella, over there, is a yellow star, like our own sun, and past his prime. Sirius, that brilliant white or bluish star, which flashes like a diamond in the south, is one of the fiercest. He is a double star, his companion being seven and himself thirteen times massier than the sun; but they are fifty times brighter, and a million times further off, that is to say, one hundred billion miles away. These double or twin stars are often very beautiful. The twins are of all colours, and generally match well with each other--for instance, purple and orange--green and orange--red and green--blue and pale green--white and ruby. One of the prettiest lies in the constellation Cygnus. I will show it to you."`;
function setupCanvas(
  selector: string,
  typesize: number,
  weight = "bold",
  linespacing = 1.4
) {
  console.log(
    `Rendering canvas with selector: ${selector} at size ${typesize}`
  );
  const canvas = $(selector) as JQuery<HTMLCanvasElement>;
  let height = "600px";
  canvas.css({
    height,
    border: "1px solid black",
  });
  canvas.attr("width", "100%");
  canvas.attr("height", height);
  (canvas[0] as HTMLCanvasElement).width = $(selector).parent().width()!;
  let context = (canvas[0] as HTMLCanvasElement).getContext("2d", {
    // alpha: false,
  });

  //   if (typesize <= 12) {
  let blur = $("#blur")!.val() as number;
  if (blur > 0) {
    //   let blur = 1;
    context!.filter = `blur(${blur}px)`;
  }
  (context! as any).textRendering = $(
    "#rendering"
  )!.val() as CanvasTextRendering; // Out of date typescript types
  context!.font = `${weight} ${typesize}pt ` + $("#font")!.val();
  // Clear the canvas white
  context!.fillStyle = "white";
  context!.fillRect(0, 0, canvas.width()!, canvas.height()!);
  context!.fillStyle = "black";

  let cursorY = typesize;
  let words = TEXT.replace("\n", " ").split(" ");
  let counter = 0;
  while (true) {
    // Do a line
    let cursorX = 0;
    while (cursorX < canvas.width()!) {
      let word = words[counter];
      counter += 1;
      counter = counter % words.length;
      let metrics = context!.measureText(word);
      context!.fillText(word, cursorX, cursorY);
      if (cursorX + metrics.width > canvas.width()!) {
        break;
      }
      cursorX += metrics.width + context!.measureText(" ").width;
    }
    cursorY += typesize * linespacing;
    if (cursorY > canvas.height()! + typesize) {
      break; // Stop if we exceed the canvas height
    }
  }

  // Measure percentage grey
  let imagedata = context!.getImageData(
    0,
    0,
    canvas.width()!,
    canvas.height()!
  );
  let data = imagedata.data;
  let total = 0;
  let count = 0;
  for (let i = 0; i < data.length; i += 4) {
    // Get the average of the RGB values
    let whiteness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    let blackness = (255 - whiteness) / 255;
    let alpha = data[i + 3] / 255; // Normalize alpha to [0, 1]
    let avg = blackness * alpha; // Adjust average by alpha
    total += avg;
    count++;
  }
  let grey = (total / count) * 100.0;
  $(selector + "-results").html(
    `Weight: <b>${weight}</b> Grey: <b>${grey.toFixed(1)}%</b>`
  );
  let greycss = 255 - 2.5 * grey;
  $(selector + "-greybox").css(
    "background-color",
    `rgb(${greycss}, ${greycss}, ${greycss})`
  );
  return grey;
}

let chart: Chart | undefined = undefined;

function runExperiments() {
  let experiments = [6, 12, 36];
  $("#experiments").empty();
  for (var experiment of experiments) {
    $("#experiments").append(`
            <div style="width: ${100 / experiments.length}%;">
            <span id="canvas${experiment}-greybox" class="swash"></span>
            <h2>${experiment}pt</h2>
            <div id="canvas${experiment}-results" class="results">
            </div>
            <canvas id="canvas${experiment}" class="specimen"> </canvas>
        </div>
        `);
    setupCanvas("#canvas" + experiment, experiment);
    console.log(`Canvas with ${experiment}pt Savate font has been set up.`);
  }
  let rampresults = [];
  $("#rampholder").html(`        <div id="canvasramp-results"></div>
        <canvas id="canvasramp" class="specimen"> </canvas>
`);
  for (let i = 6; i <= 36; i += 1) {
    let grey = setupCanvas(`#canvasramp`, i);
    rampresults.push({ pointsize: i, grey: grey });
  }
  $("#canvasramp").remove();
  $("#canvasramp-results").remove();
  let regressionResult = regression.linear(
    rampresults.map((row) => [row.pointsize, row.grey])
  );
  if (chart !== undefined) {
    chart.destroy();
  }
  chart = new Chart(
    (document.getElementById("rampchart") as HTMLCanvasElement)!,
    {
      type: "line",
      options: {
        scales: {
          x: { title: { text: "Point Size", display: true } },
          y: { title: { text: "Grey Percentage", display: true } },
        },
        plugins: {
          legend: {
            display: false,
          },
        },
      },
      data: {
        labels: rampresults.map((row) => row.pointsize),
        datasets: [
          {
            label: "Grey Percentage",
            data: rampresults.map((row) => row.grey),
          },
          {
            label: "",
            data: rampresults.map(
              (row) => regressionResult.predict(row.pointsize)[1]
            ),
            borderColor: "red",
            pointRadius: 0,
            fill: false,
            type: "line",
          },
        ],
      },
    }
  );
}

$(() => {
  // Disable controls on Safari
  if (
    navigator.userAgent.includes("Safari") &&
    !navigator.userAgent.includes("Chrome")
  ) {
    $("#blurspan").addClass("disabled");
    ($("#blur") as JQuery<HTMLInputElement>).prop("disabled", true);
    ($("#rendering") as JQuery<HTMLInputElement>).prop("disabled", true);
  }
  $("#blur, #rendering, #font").on("change", () => {
    console.log("Redrawing canvases with new settings");
    setTimeout(runExperiments, 1);
  });
  const fonts = ["Lato", "Savate", "sans-serif", "serif"];
  let chain: Promise<any> = Promise.resolve();
  for (const font of fonts) {
    $("#font").append(`<option value="${font}">${font}</option>`);
    chain = chain.then(() => {
      return document.fonts.load(`36px ${font}`);
    });
  }

  chain.then(() => {
    console.log(document.fonts.check("bold 36pt Lato"));
    console.log("Fonts are ready, running experiments");
    setTimeout(runExperiments, 1);
  });
});
