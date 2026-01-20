/**
 * DirtyStateTracker - Tracks whether the blueprint has unsaved/uncompiled changes
 */
export class DirtyStateTracker {
    constructor(app) {
        this.app = app;
        this.isDirty = false;
        this.compileIcon = document.getElementById('compile-status-icon');
        }

    markDirty() {
        if (!this.isDirty) {
            this.isDirty = true;
            this.updateIcon();
        }
    }

    markClean() {
        if (this.isDirty) {
            this.isDirty = false;
            this.updateIcon();
        }
    }

    updateIcon() {
        if (!this.compileIcon) return;
        
        if (this.isDirty) {
            // Yellow question mark for dirty state
            this.compileIcon.className = 'fas fa-question';
            this.compileIcon.style.color = '#FFA726';
        } else {
            // Green checkmark for clean state
            this.compileIcon.className = 'fas fa-check';
            this.compileIcon.style.color = '#4CAF50';
        }
    }
}
