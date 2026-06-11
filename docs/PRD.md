# PRD: BMW S58 Engine 3D Interactive Training Simulator

## 1. Product Summary

The product is a 3D interactive training simulator for professional mechanics to learn the internal structure, assembly logic, and service-relevant components of the BMW S58 engine.

Users can inspect the complete engine, select individual components, move parts away from the assembly, view an exploded structure, follow guided disassembly and reassembly procedures, and complete knowledge checks. The product should feel like a practical workshop training tool, not a casual game.

## 2. Product Goals

- Help professional mechanics understand how the BMW S58 engine is constructed.
- Teach the spatial relationship between major engine systems and components.
- Support guided teardown and reassembly workflows.
- Reduce dependence on static diagrams, PDFs, and instructor-only demonstrations.
- Provide assessment data showing whether a trainee understands component identity, order, function, and placement.

## 3. Target Users

### Primary Users

- Professional automotive mechanics.
- BMW service technicians.
- Engine repair trainees.
- Technical training center students.

### Secondary Users

- Workshop instructors.
- Technical curriculum designers.
- Service managers evaluating technician readiness.

## 4. Core User Problems

- Static service manuals do not clearly show how internal engine parts relate in 3D space.
- Physical engine teardown is expensive, time-consuming, and limited by workshop availability.
- Trainees may know part names but not assembly order, orientation, or system relationships.
- Instructors need a repeatable way to demonstrate the same engine structure to multiple trainees.
- Mechanics need to practice inspection and assembly concepts without risking real parts.

## 5. Product Scope

### MVP Scope

The MVP should include:

- Interactive 3D model of the BMW S58 engine.
- Mouse-based camera controls: rotate, pan, zoom, reset view.
- Selectable engine parts.
- Drag-to-move selected parts away from the engine.
- Exploded view mode.
- Part labels and part information panel.
- Guided disassembly sequence for major visible systems.
- Reassembly practice mode with basic placement validation.
- Basic quiz mode for identifying parts and functions.
- Progress tracking for individual trainees.

### Out of Scope for MVP

- Full fluid dynamics simulation.
- Full engine combustion simulation.
- Torque calculation or real-time mechanical stress simulation.
- VR-only experience.
- Multiplayer workshop mode.
- Support for engines other than BMW S58.
- Direct integration with BMW proprietary diagnostic systems.

## 6. Key Training Modes

### 6.1 Explore Mode

Allows trainees to freely inspect the engine.

Requirements:

- Rotate around the complete engine.
- Zoom into internal areas.
- Click or hover to highlight parts.
- Display part name, system, basic function, and service notes.
- Allow selected parts to be pulled away from the engine.
- Provide a reset button to return moved parts to original positions.

### 6.2 Exploded View Mode

Shows the engine separated into logical component groups.

Requirements:

- Smooth transition from assembled engine to exploded view.
- Group parts by major systems:
  - Cylinder block and crankcase.
  - Cylinder head and valvetrain.
  - Crankshaft, pistons, and connecting rods.
  - Timing system.
  - Turbocharging system.
  - Intake system.
  - Exhaust system.
  - Cooling system.
  - Lubrication system.
  - Fuel injection system.
- Allow trainees to isolate one system at a time.
- Allow users to collapse the exploded view back into the assembled engine.

### 6.3 Guided Disassembly Mode

Teaches correct part removal order.

Requirements:

- Present step-by-step disassembly tasks.
- Highlight the next removable part or group.
- Prevent or warn against removing parts out of sequence.
- Explain why the sequence matters.
- Track completion of each step.
- Include instructor-authored notes for service risks and inspection points.

### 6.4 Reassembly Practice Mode

Allows trainees to place parts back into correct positions.

Requirements:

- Start from a partially or fully disassembled engine.
- Let trainees drag parts into target positions.
- Snap parts into place when close to correct position and orientation.
- Validate correct part placement.
- Show mistakes with concise feedback.
- Record time, attempts, incorrect placements, and completed steps.

### 6.5 Assessment Mode

Tests practical understanding.

Requirements:

- Ask trainees to identify parts by clicking them.
- Ask trainees to select the correct part for a function.
- Ask trainees to place parts in correct assembly order.
- Ask trainees to locate components related to a system, such as lubrication or turbocharging.
- Generate a score and completion report.

## 7. Core Features

### 7.1 3D Engine Model

Requirements:

- Must represent the BMW S58 engine with high mechanical accuracy.
- Must include major external and internal components.
- Must support part-level selection for training-relevant components.
- Must support hiding, isolating, moving, and resetting components.
- Must use optimized geometry suitable for real-time interaction.

Accuracy expectations:

- Part shapes, placement, and relationships should be accurate enough for professional training.
- The simulator should distinguish between simplified visual parts and training-critical parts.
- Any simplified or omitted component must be documented.

### 7.2 Part Metadata

Each selectable part should include:

- Part name.
- System category.
- Function.
- Location.
- Related parts.
- Removal dependencies.
- Reassembly dependencies.
- Inspection notes.
- Common failure or wear points, where relevant.
- Training difficulty level.

### 7.3 Interaction Controls

Required controls:

- Left mouse drag: rotate camera.
- Right mouse drag or modifier drag: pan camera.
- Scroll wheel: zoom.
- Click part: select.
- Drag selected part: move part along an assisted axis or free movement mode.
- Double-click part: focus camera.
- Reset view.
- Reset selected part.
- Reset all parts.

Professional training requirement:

- Movement should be controlled and predictable. The simulator should avoid loose arcade-style physics for core training workflows.

### 7.4 Visual Feedback

Required visual states:

- Hover highlight.
- Selected highlight.
- Movable part highlight.
- Locked part state.
- Incorrect action warning.
- Correct placement confirmation.
- Hidden part state.
- Isolated system view.

### 7.5 Learning Panel

The UI should include a persistent information panel showing:

- Selected part name.
- System category.
- Short function description.
- Assembly role.
- Removal notes.
- Related parts.
- Training objective for the current mode.

The UI should avoid long manual-style text in the main viewport. Detailed explanations can be opened on demand.

### 7.6 Instructor Dashboard

MVP dashboard requirements:

- View trainee completion status.
- View assessment scores.
- View incorrect answers.
- View disassembly and reassembly attempts.
- Export basic progress report as CSV.

## 8. User Stories

### Trainee

- As a trainee, I want to rotate and inspect the S58 engine so that I can understand its full layout.
- As a trainee, I want to pull parts away from the engine so that I can see how internal components fit together.
- As a trainee, I want to isolate one system so that I can focus on a specific repair topic.
- As a trainee, I want guided disassembly steps so that I learn the correct removal order.
- As a trainee, I want placement feedback during reassembly so that I can correct mistakes.
- As a trainee, I want quizzes so that I can confirm whether I remember component names and functions.

### Instructor

- As an instructor, I want to assign a training module so that trainees follow a consistent curriculum.
- As an instructor, I want to see trainee mistakes so that I can identify weak areas.
- As an instructor, I want to demonstrate exploded views so that I can explain system relationships clearly.
- As an instructor, I want reusable training modules so that I can teach the same topic across classes.

## 9. MVP Training Content

The first release should cover these modules:

1. Engine architecture overview.
2. Cylinder block and rotating assembly.
3. Cylinder head and valvetrain.
4. Timing system.
5. Turbocharging and intake path.
6. Lubrication system.
7. Cooling system.
8. Guided high-level teardown.
9. Guided high-level reassembly.
10. Final part identification assessment.

## 10. Functional Requirements

### Engine Interaction

- The system shall render an interactive 3D S58 engine model.
- The system shall allow users to select training-relevant parts.
- The system shall allow users to move selected parts away from their original positions.
- The system shall preserve original part positions for reset and reassembly validation.
- The system shall support hiding and isolating selected parts or systems.
- The system shall support exploded view by system and by full engine.

### Training Flow

- The system shall provide guided disassembly steps.
- The system shall validate whether a part can be removed at the current step.
- The system shall provide feedback when a user attempts an incorrect action.
- The system shall provide guided reassembly steps.
- The system shall validate part placement against correct position and orientation.

### Assessment

- The system shall support part identification questions.
- The system shall support assembly order questions.
- The system shall track score, time, attempts, and completion.
- The system shall store user progress locally or in a backend service.

### Instructor Features

- The system shall allow an instructor to view trainee results.
- The system shall allow exporting basic reports.
- The system shall allow training modules to be enabled or disabled.

## 11. Non-Functional Requirements

### Performance

- Target 60 FPS on recommended hardware.
- Minimum acceptable performance: 30 FPS during complex exploded views.
- Initial load should complete within 10 seconds on recommended hardware after assets are cached.
- Part selection feedback should appear within 100 ms.

### Platform

MVP target:

- Desktop browser.
- Chrome and Edge latest stable versions.
- Mouse and keyboard input.

Future support:

- Windows desktop app.
- Touchscreen training kiosk.
- VR or AR training mode.

### Reliability

- User progress must not be lost during normal navigation.
- Reset actions must reliably restore all parts to known valid positions.
- Training validation must be deterministic.

### Accessibility

- UI text must be readable on common training-room displays.
- Important color states must also use shape, icon, or label differences.
- Core workflows should be usable without audio.

### Security and Privacy

- Trainee records should only store training-relevant data.
- Instructor access should require authentication in multi-user deployments.
- Exported reports should avoid unnecessary personal data.

## 12. Data Model

### Part

- `id`
- `name`
- `system`
- `description`
- `function`
- `modelNodeId`
- `defaultPosition`
- `defaultRotation`
- `explodedPosition`
- `removalOrder`
- `dependencies`
- `relatedPartIds`
- `inspectionNotes`
- `difficulty`

### Training Module

- `id`
- `title`
- `objective`
- `system`
- `steps`
- `assessmentItems`
- `estimatedDuration`

### Training Session

- `id`
- `userId`
- `moduleId`
- `startedAt`
- `completedAt`
- `score`
- `timeSpent`
- `mistakes`
- `completedSteps`

## 13. UX Requirements

- The first screen should open directly into the 3D engine training environment.
- The product should not use a marketing-style landing page.
- The engine should be the primary visual focus.
- Controls should be compact and workshop-friendly.
- Toolbars should use recognizable icons with tooltips.
- Training instructions should be concise and tied to the current task.
- The UI should support both free exploration and structured training without changing products.

## 14. Technical Recommendations

Suggested stack:

- Three.js or Babylon.js for 3D rendering.
- React or Vue for UI.
- glTF or GLB for 3D model delivery.
- Draco or Meshopt compression for large models.
- IndexedDB or backend API for local progress storage.
- Backend service for instructor dashboard and multi-user progress.

Important technical needs:

- Part metadata must map cleanly to 3D model nodes.
- The model pipeline must support part-level pivots and original transforms.
- The app should separate training logic from rendering logic.
- The system should support progressive loading for heavy model assets.
- The project should include a model validation workflow to verify selectable parts and metadata completeness.

## 15. Success Metrics

### Training Effectiveness

- Trainees improve assessment scores after guided interaction.
- Trainees correctly identify major S58 components after completing modules.
- Trainees complete guided reassembly with fewer mistakes over repeated attempts.

### Product Usage

- Training module completion rate.
- Average time spent per module.
- Number of parts inspected per session.
- Repeat usage by trainees.

### Instructor Value

- Instructor adoption rate.
- Number of assigned modules completed.
- Reduction in instructor time spent explaining basic engine layout.
- Positive instructor feedback on accuracy and usability.

## 16. Risks and Mitigations

### Risk: Inaccurate 3D Model

Mitigation:

- Require review by qualified BMW engine specialists.
- Mark simplified components clearly in internal documentation.
- Maintain a validation checklist for each system.

### Risk: Model Too Heavy for Browser

Mitigation:

- Use level-of-detail models.
- Compress geometry and textures.
- Load systems progressively.
- Keep training-critical parts high quality and simplify background parts.

### Risk: Interaction Feels Like a Toy

Mitigation:

- Use controlled movement, snap points, and validation instead of loose physics.
- Focus feedback on service logic and training objectives.
- Avoid unnecessary game effects.

### Risk: Training Content Becomes Too Text-Heavy

Mitigation:

- Keep core explanations short.
- Use visual highlighting and step-based guidance.
- Put detailed notes behind expandable panels.

## 17. Release Plan

### Phase 1: Prototype

- Load basic S58 engine model.
- Camera controls.
- Part selection.
- Manual part movement.
- Basic labels.

### Phase 2: MVP

- Accurate part metadata.
- Exploded view.
- Guided disassembly.
- Basic reassembly validation.
- Quiz mode.
- Local progress tracking.

### Phase 3: Training Deployment

- Instructor dashboard.
- Multi-user accounts.
- Report export.
- Expanded training modules.
- Model accuracy review workflow.

### Phase 4: Advanced Simulation

- VR or AR mode.
- Deeper service procedure modules.
- Diagnostic scenario training.
- Advanced scoring and certification support.

## 18. Open Questions

- What source will be used for the legally approved S58 3D model?
- What level of detail is required for internal components in the first release?
- Should the product support official BMW training curriculum alignment?
- Should the app run fully offline in a training center?
- What languages should be supported at launch?
- What certification or scoring standard should be used for professional training?

