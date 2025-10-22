// controllers/animationController.js
import animation from '../models/mongo/animation.js';
// import { asyncHandler } from '../utils/asyncHandler.js'; // Uncomment if used

// Utility function to convert JavaScript-style props to CSS-style strings
const toCssStyle = (styleObject) => {
  return Object.entries(styleObject)
    .map(([prop, value]) => {
      const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssProp}:${value}`;
    })
    .join(';');
};

// 1. Save or Update Animation
export const saveAnimation = async (req, res) => {
  const { _id, name, stages, nextComponentId } = req.body;
  const teacherId = req.user.id; // Assuming user ID is available via middleware

  try {
    const animationData = { name, stages, nextComponentId, dateUpdated: Date.now() };

    let animation;
    if (_id) {
      // Update existing
      animation = await Animation.findByIdAndUpdate(_id, animationData, { new: true });
      if (!animation) return res.status(404).json({ message: 'Animation not found' });
    } else {
      // Create new
      animation = await Animation.create({ ...animationData, teacher: teacherId });
    }

    res.status(200).json(animation);
  } catch (error) {
    res.status(500).json({ message: 'Error saving animation', error: error.message });
  }
};

// 2. HTML Download Endpoint
export const downloadAnimation = async (req, res) => {
  const { stages } = req.body;

  if (!stages || stages.length < 1) {
    return res.status(400).send('Animation data is required.');
  }

  const initialComponents = stages[0].components
    .map(
      (comp) => `
        <div id="comp-${comp.id}" class="animated-component ${comp.type}" style="${toCssStyle(comp.style)}">
          ${comp.content}
        </div>`
    )
    .join('\n');

  const animationScript = `
    const stages = ${JSON.stringify(stages)};

    function toCssProp(prop) {
      return prop.replace(/([A-Z])/g, '-$1').toLowerCase();
    }

    function runAnimation() {
      let currentTime = 0;
      for (let i = 1; i < stages.length; i++) {
        const currentStage = stages[i];
        setTimeout(() => {
          currentStage.components.forEach(nextComp => {
            const componentElement = document.getElementById(\`comp-\${nextComp.id}\`);
            if (componentElement) {
              componentElement.style.transition = \`all \${currentStage.duration}s ease-in-out\`;
              Object.entries(nextComp.style).forEach(([prop, value]) => {
                componentElement.style[toCssProp(prop)] = value;
              });
            }
          });
        }, currentTime * 1000);
        currentTime += currentStage.duration;
      }
    }
    document.addEventListener('DOMContentLoaded', runAnimation);
  `;

  const finalHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Teacher Animation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    #animation-container {
      position: relative;
      width: 800px;
      height: 600px;
      border: 2px solid #ccc;
      margin: 20px auto;
      overflow: hidden;
      background-color: #f8f8f8;
    }
    .animated-component {
      position: absolute;
      box-sizing: border-box;
      transition: all 0s ease-in-out;
      cursor: default;
    }
    .circle { border-radius: 50%; }
    .square { border-radius: 0; }
    .triangle {
      width: 0;
      height: 0;
      border-left: 50px solid transparent;
      border-right: 50px solid transparent;
      border-bottom-width: 100px;
      border-bottom-style: solid;
    }
    .text {
      white-space: nowrap;
      font-size: 24px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  </style>
</head>
<body>
  <div id="animation-container">
    ${initialComponents}
  </div>
  <script>
    ${animationScript}
  </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', 'attachment; filename="animation.html"');
  res.send(finalHTML);
};

// 3. Other necessary CRUD functions (placeholders)
export const getAnimationById = async (req, res) => {
  // TODO: implement findById logic
};

export const getTeacherAnimations = async (req, res) => {
  // TODO: implement find by teacher logic
};
