import {
  AddMarkStep,
  AttrStep,
  RemoveMarkStep,
  ReplaceAroundStep,
  ReplaceStep,
  Step
} from "prosemirror-transform";

export const isRangeStep = (
  step: Step
): step is AddMarkStep | ReplaceAroundStep | ReplaceStep | RemoveMarkStep => {
  return [AddMarkStep, ReplaceAroundStep, ReplaceStep, RemoveMarkStep].some(
    Constructor => step instanceof Constructor
  );
};

export const isReplaceStep = (step: Step): step is ReplaceAroundStep | ReplaceStep => {
  return [ReplaceAroundStep, ReplaceStep].some(Constructor => step instanceof Constructor);
};

export const isAttrStep = (step: Step, allowKeys: string[] = []): step is AttrStep => {
  return [AttrStep].some(Constructor => {
    if (step instanceof Constructor) {
      return allowKeys.length === 0 || allowKeys.includes(step.attr);
    }
    return false;
  });
};
