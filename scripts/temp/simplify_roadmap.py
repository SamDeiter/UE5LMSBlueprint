import os

roadmap_path = r'c:\Users\Sam Deiter\.gemini\antigravity\brain\87c5751b-1dc4-4bb1-b05b-4f5614fc6a28\next_steps_roadmap.md'

with open(roadmap_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip_section = False

for line in lines:
    # Remove the excessive documentation focus in Option D
    if "### **Option D: Polish & Testing Phase**" in line:
        new_lines.append("### **Option D: Polish & Performance Phase** (6-8 hours)\n")
        continue

    if "Documentation - Create user guide and tutorials" in line:
        new_lines.append("- **User Guide** - Essential documentation on tool usage\n")
        continue

    # Remove the specific sub-list of tutorials/teacher resources
    if "4. **Documentation**" in line:
        new_lines.append("4. **Maintenance**\n")
        skip_section = True
        continue

    if skip_section:
        if line.startswith("   -") or line.strip() == "":
            if "- User guide" in line:
                new_lines.append("   - User Guide (concise focus)\n")
            continue
        else:
            skip_section = False

    # Standardize the success criteria
    if "User documentation complete" in line:
        new_lines.append("- ✅ Concise user guide for testing usage\n")
        continue
    if "Example blueprints provided" in line or "Ready for classroom deployment" in line:
        continue

    new_lines.append(line)

with open(roadmap_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✓ Simplified roadmap to focus on technical polish and a concise user guide.")
