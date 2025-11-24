# AI Elements Integration TODO

## Current Status: Phase 1 Partial Complete ✅

Branch: `ai-elements`

---

## Phase 1: Quick Wins (In Progress)

### ✅ Completed
- [x] Add AI Elements configuration to config.ts
- [x] Install Shimmer component
- [x] Integrate Shimmer into conversation-messages
- [x] Install Suggestion component
- [x] Create suggestions constants file
- [x] Integrate Suggestions into ChatInterface

### 🚧 In Progress
- [ ] Fix Shimmer visibility issue
  - **Problem**: Shimmer may not show because text arrives too quickly
  - **Options**:
    1. Show shimmer during "submitted" status (before streaming starts)
    2. Show shimmer when text length < 10 characters
    3. Always show shimmer above streaming text for last assistant message
  - **Decision needed**: Which approach to use?

### 📋 Remaining
- [ ] Install Actions component
- [ ] Replace message-actions with AI Elements actions
- [ ] Add components to AIElementsTestPage
- [ ] Update documentation in CLAUDE.md
- [ ] Test Phase 1 components
- [ ] Commit Phase 1 completion

---

## Phase 2: Context Awareness (Planned)

### Backend Work
- [ ] Add token counting to chat endpoint
- [ ] Return token usage in response metadata
- [ ] Store token usage in message metadata

### Frontend Work
- [ ] Install Context component
- [ ] Create context-store.ts (following model-store pattern)
  - Custom selector hooks (useTokensUsed, useTokenLimit)
  - No .getState() anti-patterns
- [ ] Create token-counter.ts utility
  - Simple estimation: chars / 4
  - Use CONTEXT_WARNING_THRESHOLD from config
- [ ] Integrate Context into prompt-input
  - Display near ModelSelector
  - Warning when threshold exceeded
- [ ] Test and commit Phase 2

---

## Phase 3: RAG Foundation (Planned)

### Frontend Work
- [ ] Install inline-citation component (lazy load)
- [ ] Install sources component (lazy load)
- [ ] Update response.tsx with custom markdown renderer
  - Handle `cite:` protocol for citations
  - Use MAX_INLINE_CITATIONS from config
- [ ] Add Sources component to conversation-messages
  - Show for messages with sourceMetadata
  - Clickable to open KB panel

### Backend Work
- [ ] Add citation support to agent.py
- [ ] Include source metadata in chat responses
- [ ] Return sources array in responses

### Testing & Commit
- [ ] Test citation hovering
- [ ] Test sources panel
- [ ] Commit Phase 3

---

## Known Issues

### Shimmer Component
- **Where it should show**: In assistant messages during the brief moment between:
  1. Streaming starts (`status === 'streaming'`)
  2. First text chunk arrives (`textContent` is empty)
- **Timing window**: Typically 0.5-2 seconds
- **Current condition**: `isStreaming && !textContent && message.role === 'assistant'`
- **Problem**: If backend sends text immediately, this window is too brief to see
- **Impact**: Users may never see the shimmer animation

### Suggestions Component
- **Current behavior**: Shows 6 random suggestions based on model template
- **Templates supported**: social, code, research, writing, data, default
- **Location**: Empty state in ChatInterface
- **Working**: ✅ Yes

---

## File Changes (Phase 1)

### New Files
- `src/components/ai-elements/shimmer.tsx` - AI Elements component
- `src/components/ai-elements/suggestion.tsx` - AI Elements component
- `src/components/ui/scroll-area.tsx` - Dependency for suggestions
- `src/constants/suggestions.ts` - Template-based suggestion sets
- `src/constants/config.ts` - AI_ELEMENTS_CONFIG section

### Modified Files
- `src/components/ChatInterface.tsx` - Added suggestions to empty state
- `src/components/ai-elements/conversation-messages.tsx` - Added shimmer logic
- `src/constants/index.ts` - Export config (Note: User reverted this, check before re-adding)
- `package.json` / `package-lock.json` - New dependencies

---

## Code Quality Checklist

### Before Each Commit
- [ ] Zero TypeScript errors (`npm run typecheck`)
- [ ] All tests passing (`npm test`)
- [ ] ESLint clean (`npm run lint`)
- [ ] No .getState() anti-patterns
- [ ] Custom selector hooks for Zustand stores
- [ ] All constants in config.ts (no hardcoded values)
- [ ] Lazy loading for components >50KB
- [ ] Memory cleanup (useEffect cleanup functions)

---

## Testing Strategy

### Manual Testing
- [ ] Test shimmer appears (may need visibility fix first)
- [ ] Test suggestion clicks start conversations
- [ ] Test light/dark mode compatibility
- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility

### Automated Testing
- [ ] Add tests for suggestion component
- [ ] Add tests for shimmer component
- [ ] Update ChatInterface tests for suggestions
- [ ] Update conversation-messages tests for shimmer

---

## Documentation Updates Needed

### CLAUDE.md
- [ ] Document AI Elements integration
- [ ] Document new components (Shimmer, Suggestion)
- [ ] Document AI_ELEMENTS_CONFIG constants
- [ ] Document suggestions.ts template system

### Component Files
- [ ] Add JSDoc comments to shimmer integration
- [ ] Add JSDoc comments to suggestion integration
- [ ] Document props and usage examples

---

## Next Session Tasks

**Immediate (30 minutes):**
1. Decide on shimmer visibility fix approach
2. Implement shimmer fix
3. Test shimmer actually shows

**Short-term (2 hours):**
4. Install Actions component
5. Replace message-actions with AI Elements actions
6. Test and commit

**Medium-term (4 hours):**
7. Add to AIElementsTestPage
8. Update documentation
9. Complete Phase 1

**Long-term (1-2 days):**
10. Phase 2: Context awareness
11. Phase 3: RAG citations

---

## Notes

- Following new architecture patterns from frontend optimization
- Using centralized config.ts (no hardcoded values)
- Using custom selector hooks for Zustand (no .getState())
- Lazy loading heavy components
- Memory cleanup with timers (following DataStreamProvider pattern)

## Questions to Resolve

1. **Shimmer visibility**: Which fix approach should we use?
2. **Actions component**: Full migration or keep custom message-actions?
3. **Testing priority**: Update existing tests now or later?
4. **Phase 2 timing**: Start context awareness next or finish Phase 1 completely first?
