# Documentation Migration Script
## Automated .md File Reorganization

**Created**: 2024-01-15  
**Status**: Ready for Execution  
**Purpose**: Move existing .md files to organized /docs structure

---

## 🔄 **Migration Commands**

### **Step 1: Move Root Level Files**
```bash
# Move root documentation files to appropriate categories
mv MEMORY_V2_PLANNING.md docs/implementation/IMPL_MEMORY_V2_PLANNING.md
mv RESTRUCTURE_COMPLETED.md docs/progress/PROG_ARCHITECTURE_COMPLETED.md  
mv TASK_PROMPTS_GUIDE.md docs/implementation/IMPL_TASK_PROMPTS_GUIDE.md
mv MEMORY_SYSTEM_IMPLEMENTATION.md docs/implementation/IMPL_MEMORY_SYSTEM.md
mv MEMORY_V2_TASKS.md docs/implementation/IMPL_MEMORY_V2_TASKS.md
mv VOICE_CHAT_FLOWCHART.md docs/architecture/ARCH_VOICE_CHAT_FLOW.md
mv MEMORY_V2_UPGRADE_FLOWCHART.md docs/architecture/ARCH_MEMORY_V2_UPGRADE_FLOW.md

# Keep CLAUDE.md in root (special architecture enforcement file)
# Keep README.md in root (main project entry point)
```

### **Step 2: Move Intellegent-System Folder Files**
```bash
# Architecture documents
mv Intellegent-System/PROJECT_ARCHITECTURE.md docs/architecture/ARCH_PROJECT_DESIGN.md

# Implementation documents  
mv Intellegent-System/TASKS.md docs/implementation/IMPL_TASKS_MASTER.md
mv Intellegent-System/1-MEMORY_V2_IMPLEMENTATION_PLAN.md docs/implementation/IMPL_MEMORY_V2_DETAILED.md
mv Intellegent-System/2-ADAPTIVE_EMOTIONAL_INTELLIGENCE_SYSTEM.md docs/implementation/IMPL_EMOTIONAL_INTELLIGENCE.md
mv Intellegent-System/3-UNIFIED_IMPLEMENTATION_STRATEGY.md docs/implementation/IMPL_UNIFIED_STRATEGY.md
mv Intellegent-System/CURRENT_SYSTEM_MODIFICATION_GUIDE.md docs/guides/GUIDE_SYSTEM_MIGRATION.md
mv Intellegent-System/starting-wow-factor.md docs/implementation/IMPL_WOW_FACTOR_FEATURES.md

# Business documents
mv Intellegent-System/BUSINESS_VALUE_ANALYSIS.md docs/business/BIZ_VALUE_ANALYSIS.md

# Marketing subfolder
mv Intellegent-System/Marketing/JVZOO_AFFILIATE_STRATEGY.md docs/business/BIZ_JVZOO_STRATEGY.md
mv Intellegent-System/Marketing/JVZOO_PRICING_STRATEGY.md docs/business/BIZ_PRICING_STRATEGY.md
mv Intellegent-System/Marketing/client-pitch.md docs/business/BIZ_CLIENT_PITCH.md
mv Intellegent-System/Marketing/realistic-client-pitch.md docs/business/BIZ_CLIENT_PITCH_v2.md
mv Intellegent-System/Marketing/features-jvzoo-alternatives.md docs/business/BIZ_PLATFORM_ALTERNATIVES.md
```

### **Step 3: Clean Up Empty Directories**
```bash
# Remove empty directories after migration
rmdir Intellegent-System/Marketing/
rmdir Intellegent-System/
```

---

## 📋 **Validation Checklist**

After running migration:

- [ ] All .md files moved to appropriate /docs subfolders
- [ ] File names follow new naming conventions (PREFIX_FEATURE_PURPOSE.md)
- [ ] No .md files remain in project root except README.md and CLAUDE.md
- [ ] Empty directories removed
- [ ] Master index updated in /docs/README.md
- [ ] All internal links updated to new paths

---

## 🔗 **Link Updates Required**

After migration, update internal links in:

1. **README.md** - Update any references to moved files
2. **CLAUDE.md** - Update any document references  
3. **Moved documents** - Update cross-references to new paths
4. **Client/frontend** - Update any hardcoded documentation paths

---

## 🎯 **Expected Results**

### **Before Migration**
```
voicechat/
├── MEMORY_V2_PLANNING.md
├── RESTRUCTURE_COMPLETED.md
├── TASK_PROMPTS_GUIDE.md
├── [8 other .md files]
├── Intellegent-System/
│   ├── PROJECT_ARCHITECTURE.md
│   ├── TASKS.md
│   ├── [6 other .md files]
│   └── Marketing/
│       └── [5 .md files]
└── [project files]
```

### **After Migration**
```
voicechat/
├── README.md (kept)
├── CLAUDE.md (kept)
├── docs/
│   ├── README.md (index)
│   ├── /architecture/ (4 files)
│   ├── /implementation/ (8 files) 
│   ├── /business/ (7 files)
│   ├── /progress/ (1 file)
│   └── /guides/ (1 file)
└── [project files]
```

**Total**: 21 .md files properly organized and categorized with consistent naming!