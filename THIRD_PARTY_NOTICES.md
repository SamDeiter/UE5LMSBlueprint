# Third-Party Software Notices and Licenses

This document provides information about third-party software, assets, and AI assistance used in the UE5 Blueprint Editor project.

---

## AI-Generated Code Disclosure

**Significant portions of this codebase were generated with AI assistance** using Google's Gemini AI models through the Antigravity IDE. The AI was used for:

- **Architecture Design**: Planning system architecture and component interactions
- **Code Implementation**: Generating JavaScript, HTML, and CSS code
- **Refactoring**: Modularizing large files and extracting reusable components
- **Documentation**: Creating technical documentation and code comments
- **Testing**: Designing test scenarios and validation logic

**Human Oversight**: All AI-generated code was reviewed, tested, and refined by the project maintainer (SamDeiter). The AI served as a development accelerator, not an autonomous code generator.

**Development Timeline**: December 2025  
**Primary AI Tool**: Google Gemini (via Antigravity IDE)  
**Development Pattern**: Iterative human-AI collaboration with frequent git commits

---

## Third-Party Software and Assets

### Font Awesome Free 6.0.0

- **Description**: Icon set and toolkit used for UI icons throughout the application
- **Usage**: Node icons, toolbar buttons, panel icons
- **License**:
  - Icons: CC BY 4.0 License (<https://creativecommons.org/licenses/by/4.0/>)
  - Fonts: SIL OFL 1.1 License (<https://scripts.sil.org/OFL>)
  - Code: MIT License (<https://opensource.org/licenses/MIT>)
- **Source**: <https://fontawesome.com>
- **Files**: Loaded via CDN in `index.html`

### Google Fonts: Inter

- **Description**: Modern sans-serif typeface used for all UI text
- **Usage**: Primary font family for the entire application
- **License**: SIL Open Font License 1.1 (<https://scripts.sil.org/OFL>)
- **Copyright**: Copyright (c) 2016-2020 The Inter Project Authors (<https://github.com/rsms/inter>)
- **Source**: <https://fonts.google.com/specimen/Inter>
- **Files**: Loaded via Google Fonts CDN

---

## Development Dependencies

The following tools are used for development and build processes (not included in production):

### ESLint 9.39.1

- **Description**: JavaScript linting utility for code quality
- **License**: MIT License
- **Source**: <https://eslint.org/>
- **Usage**: Code validation and style enforcement

### Husky 9.1.7

- **Description**: Git hooks management tool
- **License**: MIT License
- **Source**: <https://typicode.github.io/husky/>
- **Usage**: Pre-commit validation hooks

---

## Intellectual Property Notices

### Unreal Engine Trademark

This project is **NOT** developed by Epic Games, Inc.

- **"Unreal Engine"** is a trademark or registered trademark of Epic Games, Inc. in the United States of America and elsewhere.
- **"Blueprint"** visual scripting is a feature of Unreal Engine owned by Epic Games, Inc.
- This project is an **educational replica** created for learning purposes and is not affiliated with, endorsed by, or sponsored by Epic Games, Inc.

### Fair Use Statement

This project replicates the visual design and interaction patterns of Unreal Engine 5's Blueprint system for **educational and testing purposes only**. It is intended to:

- Serve as a testing platform for the Unreal Authorized Instructor program.

This project does **NOT**:

- Include any Epic Games source code
- Distribute Unreal Engine assets

---

## SCORM Compliance

This application is designed to be SCORM 1.2 compliant for use in Learning Management Systems (LMS). No additional SCORM libraries are included; the application implements SCORM API communication directly.

---

## Project License

This project is licensed under the **MIT License**. See the `LICENSE` file in the project root for full license text.

**Copyright (c) 2025 SamDeiter**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

## Attribution Requirements

If you use or redistribute this project, please include:

1. **This THIRD_PARTY_NOTICES.md file** in its entirety
2. **Credit to the original author** (SamDeiter)
3. **Disclosure of AI assistance** if you modify AI-generated portions
4. **Font Awesome and Inter font attributions** as required by their licenses

---

## Contact and Updates

- **Repository**: <https://github.com/SamDeiter/UE5LMSBlueprint>
- **Last Updated**: December 21, 2025
- **Maintained by**: SamDeiter

For questions about licensing or attribution, please open an issue on the GitHub repository.
