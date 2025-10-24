// controllers/animationController.js
import AnimationModel from '../models/mongo/animation.js';

// Utility: convert JS style object to CSS string
const toCssStyle = (styleObject) =>
  Object.entries(styleObject)
    .map(([prop, value]) => `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}:${value}`)
    .join(';');

// 🔹 Create or Update Animation
export const saveAnimation = async (req, res) => {
  const { _id, name, stages, nextComponentId } = req.body;
  const teacherId = req.user?.id || req.body.teacher;

  try {
    const animationData = { name, stages, nextComponentId, dateUpdated: Date.now() };

    let animation;
    if (_id) {
      animation = await AnimationModel.findByIdAndUpdate(_id, animationData, { new: true });
      if (!animation) return res.status(404).json({ message: 'Animation not found' });
    } else {
      animation = await AnimationModel.create({ ...animationData, teacher: teacherId });
    }

    res.status(200).json(animation);
  } catch (error) {
    console.error("Error saving animation:", error.message);
    res.status(500).json({ message: 'Error saving animation', error: error.message });
  }
};

// 🔹 Get Animation by ID
export const getAnimationById = async (req, res) => {
  const { id } = req.params;

  try {
    const animation = await AnimationModel.findById(id);
    if (!animation) return res.status(404).json({ message: 'Animation not found' });
    res.status(200).json(animation);
  } catch (error) {
    console.error("Error fetching animation by ID:", error.message);
    res.status(500).json({ message: 'Server failed to fetch animation.', error: error.message });
  }
};

// 🔹 Get all animations for the teacher
export const getTeacherAnimations = async (req, res) => {
  const teacherId = req.user?.id;
  if (!teacherId) return res.status(401).json({ message: "Not authorized." });

  try {
    const animations = await AnimationModel.find({ teacher: teacherId }).sort({ dateUpdated: -1 });
    res.status(200).json(animations);
  } catch (error) {
    console.error("Error fetching teacher animations:", error.message);
    res.status(500).json({ message: 'Server failed to fetch animations.', error: error.message });
  }
};

// 🔹 Partial Update (PATCH)
export const patchAnimation = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const animation = await AnimationModel.findByIdAndUpdate(id, { ...updateData, dateUpdated: Date.now() }, { new: true });
    if (!animation) return res.status(404).json({ message: 'Animation not found' });
    res.status(200).json(animation);
  } catch (error) {
    console.error("Error patching animation:", error.message);
    res.status(500).json({ message: 'Error updating animation', error: error.message });
  }
};

// 🔹 Delete Animation
export const deleteAnimation = async (req, res) => {
  const { id } = req.params;

  try {
    const animation = await AnimationModel.findByIdAndDelete(id);
    if (!animation) return res.status(404).json({ message: 'Animation not found' });
    res.status(200).json({ message: 'Animation deleted successfully' });
  } catch (error) {
    console.error("Error deleting animation:", error.message);
    res.status(500).json({ message: 'Error deleting animation', error: error.message });
  }
};

// 🔹 Download Animation as self-contained HTML
export const downloadAnimation = async (req, res) => {
  const { stages } = req.body;
  if (!stages || stages.length < 1) return res.status(400).send('Animation data is required.');

  const initialComponents = stages[0].components
    .map(comp => `<div id="comp-${comp.id}" class="animated-component ${comp.type}" style="${toCssStyle(comp.style)}">${comp.content}</div>`)
    .join('\n');

  const animationScript = `
    const stages = ${JSON.stringify(stages)};
    function toCssProp(prop) { return prop.replace(/([A-Z])/g, '-$1').toLowerCase(); }
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
<style>
  #animation-container { position: relative; width: 800px; height: 600px; border: 2px solid #ccc; margin: 20px auto; overflow: hidden; background-color: #f8f8f8; }
  .animated-component { position: absolute; box-sizing: border-box; transition: all 0s ease-in-out; cursor: default; }
  .circle { border-radius: 50%; } .square { border-radius: 0; }
  .triangle { width:0; height:0; border-left:50px solid transparent; border-right:50px solid transparent; border-bottom-width:100px; border-bottom-style:solid; }
  .text { white-space: nowrap; font-size:24px; font-weight:bold; display:flex; align-items:center; justify-content:center; }
</style>
</head>
<body>
<div id="animation-container">${initialComponents}</div>
<script>${animationScript}</script>
</body>
</html>
`;

  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Content-Disposition', 'attachment; filename="animation.html"');
  res.send(finalHTML);
};
