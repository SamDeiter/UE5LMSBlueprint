# Next Session Action Plan

**Created:** December 21, 2025, 11:14 PM  
**Estimated Duration:** 2-3 hours  
**Difficulty:** Medium  
**Prerequisites:** All Phase 1 & 2 work complete ✅

---

## 🎯 Session Goals

Complete Phase 3 integration work:

1. Integrate PinTypeValidator into WiringController
2. Migrate VariableController to BaseController
3. Implement Auto Node Registration

---

## 📋 Task 1: Integrate PinTypeValidator (1 hour)

### Objective

Add real-time type validation when users connect wires

### Steps

1. **Import PinTypeValidator into WiringController** (5 min)

   ```javascript
   import { PinTypeValidator } from '../utils/PinTypeValidator.js';
   ```

2. **Add validation in createLink() method** (15 min)
   - Find the `createLink(sourcePin, targetPin)` method
   - Add validation check before creating link:

   ```javascript
   const validation = PinTypeValidator.canConnect(sourcePin, targetPin);
   if (!validation.valid) {
     // Show error toast
     this.app.showToast(validation.reason, 'error');
     return null;
   }
   if (validation.warning) {
     this.app.showToast(validation.warning, 'warning');
   }
   ```

3. **Add visual feedback on hover** (20 min)
   - Highlight compatible pins green on drag
   - Highlight incompatible pins red on drag
   - Show tooltip with reason for incompatibility

4. **Test thoroughly** (20 min)
   - Test exec → exec (should work)
   - Test exec → data (should fail)
   - Test int → float (should work with warning)
   - Test float → int (should work with narrowing warning)
   - Test array → single (should fail)
   - Test wildcard → anything (should work)

### Success Criteria

- ✅ Invalid connections show error toast
- ✅ Compatible pins highlighted on drag
- ✅ Incompatible pins highlighted red
- ✅ No console errors

---

## 📋 Task 2: Migrate VariableController to BaseController (1 hour)

### Objective

Prevent memory leaks in VariableController using BaseController pattern

### Steps

1. **Import and extend BaseController** (5 min)

   ```javascript
   import { BaseController } from './BaseController.js';
   
   export class VariableController extends BaseController {
     constructor(app) {
       super(app);  // Call parent constructor
       // ... rest of constructor
     }
   }
   ```

2. **Replace addEventListener calls** (30 min)
   - Find all `addEventListener` calls (there are ~15)
   - Replace with `this.addListener(element, event, handler)`
   - Example:

     ```javascript
     // Before:
     this.createBtn.addEventListener("click", this.addVariable.bind(this));
     
     // After:
     this.addListener(this.createBtn, "click", this.addVariable.bind(this));
     ```

3. **Add cleanup() method** (10 min)

   ```javascript
   cleanup() {
     super.cleanup();  // IMPORTANT: Call parent cleanup
     console.log('VariableController cleaned up');
   }
   ```

4. **Test for memory leaks** (15 min)
   - Open Chrome DevTools → Memory tab
   - Take heap snapshot
   - Create/delete variables 10 times
   - Take another heap snapshot
   - Compare - should see minimal growth

### Success Criteria

- ✅ All functionality still works
- ✅ No console errors
- ✅ Memory usage stable after cleanup
- ✅ All event listeners properly removed

---

## 📋 Task 3: Auto Node Registration (30 min)

### Objective

Eliminate manual node registration in SimulationEngine.js

### Steps

1. **Create auto-registration method** (15 min)
   - Open `src/services/ExecutorRegistry.js`
   - Add method:

   ```javascript
   autoRegisterFromNodeDefinitions() {
     Object.entries(NodeDefinitions).forEach(([key, def]) => {
       if (def.executor && !this.executors.has(key)) {
         const executor = this.getExecutorByName(def.executor);
         if (executor) {
           this.register(key, executor);
         } else {
           console.warn(`No executor found for ${key}: ${def.executor}`);
         }
       }
     });
   }
   ```

2. **Call auto-registration in constructor** (5 min)

   ```javascript
   constructor() {
     this.executors = new Map();
     this.autoRegisterFromNodeDefinitions();
   }
   ```

3. **Remove manual registrations** (5 min)
   - Comment out manual registration code
   - Test that everything still works
   - Delete commented code if successful

4. **Test all node types** (5 min)
   - Create nodes from each category
   - Run simulation
   - Verify all executors found

### Success Criteria

- ✅ All nodes execute correctly
- ✅ No "unknown executor" warnings
- ✅ Manual registration code removed
- ✅ Cleaner SimulationEngine.js

---

## 🎯 Optional Bonus Tasks (if time permits)

### Bonus 1: Fix 12 Validation Warnings (15 min)

Add `category: "Variables"` to variable setter nodes in `VariableNodes.js`

### Bonus 2: Migrate ComponentsController (30 min)

Apply BaseController pattern to ComponentsController (~10 listeners)

### Bonus 3: Refactor InputNodes.js (30 min)

Apply PinFactory pattern to reduce duplication

---

## 📝 Pre-Session Checklist

Before starting:

- [ ] Pull latest from main
- [ ] Run `npm run serve` to start dev server
- [ ] Open Chrome DevTools
- [ ] Review `docs/BASECONTROLLER_MIGRATION.md`
- [ ] Review `src/utils/PinTypeValidator.js`

---

## 🚀 Post-Session Checklist

After completing tasks:

- [ ] Run `npm run lint` - ensure no errors
- [ ] Test in browser - verify all functionality
- [ ] Commit each task separately with clear messages
- [ ] Push to main
- [ ] Update PROJECT_STATUS.md with progress

---

## 📊 Expected Outcomes

After this session:

- ✅ Type-safe wire connections (no more runtime type errors)
- ✅ Memory leak prevention in VariableController
- ✅ Automatic node registration (no manual work)
- ✅ Phase 3 foundation complete
- ✅ Ready for remaining controller migrations

---

## 💡 Tips

1. **Take breaks** - These are focused tasks, take 5 min breaks between
2. **Test frequently** - After each change, refresh browser and test
3. **Commit often** - After each successful task, commit
4. **Use git** - If something breaks, `git checkout -- file` to revert
5. **Check console** - Watch for errors/warnings after each change

---

## 🆘 If You Get Stuck

1. **PinTypeValidator integration** - Check `src/utils/PinTypeValidator.js` for usage examples
2. **BaseController migration** - Reference `docs/BASECONTROLLER_MIGRATION.md`
3. **Auto registration** - Look at existing `ExecutorRegistry.js` methods
4. **General help** - Review `PROJECT_STATUS.md` for context

---

**Good luck! You've got this! 🚀**

The foundation work is done - this session is all about integration and seeing the benefits!
