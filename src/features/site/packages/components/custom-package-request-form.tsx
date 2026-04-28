"use client"

import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertCircle, CheckCircle2, Pencil, Plus, Trash2 } from "lucide-react"
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

type SafetyRating = "SFW" | "NSFW"

type AssetLimits = {
  character: number
  persona: number
  lorebook: number
  avatar: number
  background: number
}

type CharacterRequest = {
  messageToCreator: string
  characterName: string
  characterTags: string
  description: string
  scenarioLocationUniverse: string
  personalitySummary: string
  firstMessage: string
  alternativeFirstMessages?: string
  exampleDialogueStyle: string
  safety: SafetyRating
}

type BackgroundRequest = {
  messageToCreator: string
  backgroundName?: string
  description: string
  referenceUrl1: string
  referenceUrl2: string
  referenceUrl3: string
  safety: SafetyRating
}

type AvatarRequest = {
  messageToCreator: string
  avatarName?: string
  description: string
  referenceUrl1: string
  referenceUrl2: string
  referenceUrl3: string
  safety: SafetyRating
}

type LorebookRequest = {
  messageToCreator: string
  estimatedKeywordCount: string
  lorebookName?: string
  lorebookTags: string
  description: string
  specificKeywordsOrTerms: string
  safety: SafetyRating
}

type PersonaRequest = {
  messageToCreator: string
  personaName: string
  personaTags: string
  personaDetails: string
  safety: SafetyRating
}

type CustomPackageRequestFormProps = {
  creatorId: string
  creatorName: string
  packageId: string
  packageTitle: string
  packagePrice: number
  tokensLabel: string
  packageDescription: string
  limits: AssetLimits
}

type StepId = "character" | "persona" | "lorebook" | "background" | "avatar"

type CustomRequestFormValues = {
  character: CharacterRequest[]
  persona: PersonaRequest[]
  lorebook: LorebookRequest[]
  background: BackgroundRequest[]
  avatar: AvatarRequest[]
}

const STEPS: { id: StepId; label: string; limitKey: keyof AssetLimits }[] = [
  { id: "character", label: "Character", limitKey: "character" },
  { id: "persona", label: "Persona", limitKey: "persona" },
  { id: "lorebook", label: "Lorebook", limitKey: "lorebook" },
  { id: "background", label: "Background", limitKey: "background" },
  { id: "avatar", label: "Avatar", limitKey: "avatar" },
]

function buildCharacterRequest(): CharacterRequest {
  return {
    messageToCreator: "",
    characterName: "",
    characterTags: "",
    description: "",
    scenarioLocationUniverse: "",
    personalitySummary: "",
    firstMessage: "",
    alternativeFirstMessages: "",
    exampleDialogueStyle: "",
    safety: "SFW",
  }
}

function buildBackgroundRequest(): BackgroundRequest {
  return {
    messageToCreator: "",
    backgroundName: "",
    description: "",
    referenceUrl1: "",
    referenceUrl2: "",
    referenceUrl3: "",
    safety: "SFW",
  }
}

function buildAvatarRequest(): AvatarRequest {
  return {
    messageToCreator: "",
    avatarName: "",
    description: "",
    referenceUrl1: "",
    referenceUrl2: "",
    referenceUrl3: "",
    safety: "SFW",
  }
}

function buildLorebookRequest(): LorebookRequest {
  return {
    messageToCreator: "",
    estimatedKeywordCount: "",
    lorebookName: "",
    lorebookTags: "",
    description: "",
    specificKeywordsOrTerms: "",
    safety: "SFW",
  }
}

function buildPersonaRequest(): PersonaRequest {
  return {
    messageToCreator: "",
    personaName: "",
    personaTags: "",
    personaDetails: "",
    safety: "SFW",
  }
}

function SafetySelect({
  value,
  onChange,
  id,
}: {
  value: SafetyRating
  onChange: (next: SafetyRating) => void
  id: string
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange((next as SafetyRating) ?? "SFW")}>
      <SelectTrigger aria-label="SFW or NSFW" id={id}>
        <SelectValue placeholder="Select content safety" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="SFW">SFW</SelectItem>
        <SelectItem value="NSFW">NSFW</SelectItem>
      </SelectContent>
    </Select>
  )
}

function StepIndicator({
  currentStepIndex,
  totalSteps,
  stepLabels,
}: {
  currentStepIndex: number
  totalSteps: number
  stepLabels: string[]
}) {
  const progressPercent = ((currentStepIndex + 1) / totalSteps) * 100
  return (
    <Card className="bg-transparent border-none shodow-none ring-0">
      <CardContent className="space-y-5 pt-6">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-linear-to-r from-primary to-violet-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {stepLabels.map((label, index) => {
            const completed = index < currentStepIndex
            const active = index === currentStepIndex
            return (
              <li key={label} className="flex items-center gap-2 rounded-lg border border-border/60 px-2.5 py-2">
                <span
                  className={`inline-flex size-6 items-center justify-center rounded-full text-xs font-semibold ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : completed
                        ? "bg-emerald-600 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {completed ? <CheckCircle2 className="size-3.5" aria-hidden /> : index + 1}
                </span>
                <span
                  className={`text-xs font-medium ${
                    active ? "text-foreground" : completed ? "text-emerald-700 dark:text-emerald-400" : "text-muted-foreground"
                  }`}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ol>
      </CardContent>
    </Card>
  )
}

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || /^https?:\/\/\S+$/i.test(value), "Use a valid URL")

const characterItemSchema = z.object({
  messageToCreator: z.string().trim().min(5, "Message to creator is required"),
  characterName: z.string().trim().min(2, "Character name is required"),
  characterTags: z.string().trim().min(2, "Add at least one tag"),
  description: z.string().trim().min(20, "Character description is too short"),
  scenarioLocationUniverse: z.string().trim().min(10, "Scenario / location / universe is required"),
  personalitySummary: z.string().trim().min(10, "Personality summary is required"),
  firstMessage: z.string().trim().min(10, "First message is required"),
  alternativeFirstMessages: z.string().trim().default(""),
  exampleDialogueStyle: z.string().trim().min(10, "Example dialogue / style is required"),
  safety: z.enum(["SFW", "NSFW"]),
})

const personaItemSchema = z.object({
  messageToCreator: z.string().trim().min(5, "Message to creator is required"),
  personaName: z.string().trim().min(2, "Persona name is required"),
  personaTags: z.string().trim().min(2, "Add at least one persona tag"),
  personaDetails: z.string().trim().min(20, "Persona details are too short"),
  safety: z.enum(["SFW", "NSFW"]),
})

const lorebookItemSchema = z.object({
  messageToCreator: z.string().trim().min(5, "Message to creator is required"),
  estimatedKeywordCount: z.string().trim().min(1, "Estimated keyword/term count is required"),
  lorebookName: z.string().trim().optional(),
  lorebookTags: z.string().trim().min(2, "Add at least one lorebook tag"),
  description: z.string().trim().min(20, "Lorebook description is too short"),
  specificKeywordsOrTerms: z.string().trim().min(10, "Specific keywords or terms are required"),
  safety: z.enum(["SFW", "NSFW"]),
})

const backgroundItemSchema = z.object({
  messageToCreator: z.string().trim().min(5, "Message to creator is required"),
  backgroundName: z.string().trim().optional(),
  description: z.string().trim().min(20, "Background description is too short"),
  referenceUrl1: optionalUrl,
  referenceUrl2: optionalUrl,
  referenceUrl3: optionalUrl,
  safety: z.enum(["SFW", "NSFW"]),
})

const avatarItemSchema = z.object({
  messageToCreator: z.string().trim().min(5, "Message to creator is required"),
  avatarName: z.string().trim().optional(),
  description: z.string().trim().min(20, "Avatar description is too short"),
  referenceUrl1: optionalUrl,
  referenceUrl2: optionalUrl,
  referenceUrl3: optionalUrl,
  safety: z.enum(["SFW", "NSFW"]),
})

function makeStepArraySchema<T extends z.ZodTypeAny>(itemSchema: T, limit: number) {
  return z
    .array(itemSchema)
    .max(limit, `Maximum allowed is ${limit}`)
    .min(limit > 0 ? 1 : 0, limit > 0 ? "Add at least one item to continue" : "No items required")
}

function getErrorMessage(error: unknown) {
  return typeof error === "object" && error !== null && "message" in error
    ? String((error as { message?: string }).message ?? "")
    : ""
}

function InlineError({ message }: { message?: string }) {
  if (!message) {
    return null
  }
  return (
    <p className="inline-flex items-center gap-1 text-xs text-destructive">
      <AlertCircle className="size-3.5" aria-hidden />
      {message}
    </p>
  )
}

export function CustomPackageRequestForm({
  creatorId,
  creatorName,
  packageId,
  packageTitle,
  packagePrice,
  tokensLabel,
  packageDescription,
  limits,
}: CustomPackageRequestFormProps) {
  const formSchema = useMemo(
    () =>
      z.object({
        character: makeStepArraySchema(characterItemSchema, limits.character),
        persona: makeStepArraySchema(personaItemSchema, limits.persona),
        lorebook: makeStepArraySchema(lorebookItemSchema, limits.lorebook),
        background: makeStepArraySchema(backgroundItemSchema, limits.background),
        avatar: makeStepArraySchema(avatarItemSchema, limits.avatar),
      }),
    [limits]
  )

  const form = useForm<CustomRequestFormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      character: [],
      persona: [],
      lorebook: [],
      background: [],
      avatar: [],
    },
  })

  const { control, register, handleSubmit, trigger, formState } = form
  const { errors } = formState
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const currentStepId = STEPS[currentStepIndex].id
  const currentStepLabel = STEPS[currentStepIndex].label
  const currentStepLimit = limits[currentStepId]

  const characterArray = useFieldArray({ control, name: "character" })
  const personaArray = useFieldArray({ control, name: "persona" })
  const lorebookArray = useFieldArray({ control, name: "lorebook" })
  const backgroundArray = useFieldArray({ control, name: "background" })
  const avatarArray = useFieldArray({ control, name: "avatar" })

  const [activeItemIndexByStep, setActiveItemIndexByStep] = useState<Record<StepId, number | null>>({
    character: null,
    persona: null,
    lorebook: null,
    background: null,
    avatar: null,
  })

  const stepValues = useWatch({ control, name: currentStepId })
  const canAttemptNext =
    currentStepLimit === 0 ? true : (Array.isArray(stepValues) ? stepValues.length : 0) > 0
  const currentStepErrorMessage = getErrorMessage((errors as Record<string, unknown>)[currentStepId])

  const stepMap = {
    character: {
      title: "Character Requests",
      array: characterArray,
      add: () => characterArray.append(buildCharacterRequest()),
      editor: (index: number) => (
        <div className="space-y-3 rounded-lg border border-border/60 bg-background p-4">
          <p className="text-sm font-medium text-foreground">Character {index + 1}</p>
          <Textarea placeholder="Message to Creator" {...register(`character.${index}.messageToCreator` as const)} />
          <InlineError message={errors.character?.[index]?.messageToCreator?.message} />
          <Input placeholder="Character Name" {...register(`character.${index}.characterName` as const)} />
          <InlineError message={errors.character?.[index]?.characterName?.message} />
          <Input placeholder="Character Tags" {...register(`character.${index}.characterTags` as const)} />
          <InlineError message={errors.character?.[index]?.characterTags?.message} />
          <Textarea placeholder="Description of Character" {...register(`character.${index}.description` as const)} />
          <InlineError message={errors.character?.[index]?.description?.message} />
          <Textarea
            placeholder="Scenario / Location / Universe"
            {...register(`character.${index}.scenarioLocationUniverse` as const)}
          />
          <Textarea placeholder="Personality Summary" {...register(`character.${index}.personalitySummary` as const)} />
          <InlineError message={errors.character?.[index]?.personalitySummary?.message} />
          <Textarea placeholder="First Message" {...register(`character.${index}.firstMessage` as const)} />
          <InlineError message={errors.character?.[index]?.firstMessage?.message} />
          <Textarea
            placeholder="Alternative First Messages"
            {...register(`character.${index}.alternativeFirstMessages` as const)}
          />
          <Textarea
            placeholder="Example Dialogue / Speaking Style"
            {...register(`character.${index}.exampleDialogueStyle` as const)}
          />
          <InlineError message={errors.character?.[index]?.exampleDialogueStyle?.message} />
          <Controller
            control={control}
            name={`character.${index}.safety`}
            render={({ field }) => (
              <SafetySelect id={`character-safety-${index}`} value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      ),
    },
    persona: {
      title: "Persona Requests",
      array: personaArray,
      add: () => personaArray.append(buildPersonaRequest()),
      editor: (index: number) => (
        <div className="space-y-3 rounded-lg border border-border/60 bg-background  p-4">
          <p className="text-sm font-medium text-foreground">Persona {index + 1}</p>
          <Textarea placeholder="Message to Creator" {...register(`persona.${index}.messageToCreator` as const)} />
          <InlineError message={errors.persona?.[index]?.messageToCreator?.message} />
          <Input placeholder="Persona Name" {...register(`persona.${index}.personaName` as const)} />
          <InlineError message={errors.persona?.[index]?.personaName?.message} />
          <Input placeholder="Persona Tags" {...register(`persona.${index}.personaTags` as const)} />
          <InlineError message={errors.persona?.[index]?.personaTags?.message} />
          <Textarea placeholder="Persona Details" {...register(`persona.${index}.personaDetails` as const)} />
          <InlineError message={errors.persona?.[index]?.personaDetails?.message} />
          <Controller
            control={control}
            name={`persona.${index}.safety`}
            render={({ field }) => (
              <SafetySelect id={`persona-safety-${index}`} value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      ),
    },
    lorebook: {
      title: "Lorebook Requests",
      array: lorebookArray,
      add: () => lorebookArray.append(buildLorebookRequest()),
      editor: (index: number) => (
        <div className="space-y-3 rounded-lg border border-border/60 bg-background  p-4">
          <p className="text-sm font-medium text-foreground">Lorebook {index + 1}</p>
          <Textarea placeholder="Message to Creator" {...register(`lorebook.${index}.messageToCreator` as const)} />
          <InlineError message={errors.lorebook?.[index]?.messageToCreator?.message} />
          <Input
            placeholder="Estimated Keyword / Term Count"
            {...register(`lorebook.${index}.estimatedKeywordCount` as const)}
          />
          <Input
            placeholder="Lorebook Name (or leave blank for creator)"
            {...register(`lorebook.${index}.lorebookName` as const)}
          />
          <Input placeholder="Lorebook Tags" {...register(`lorebook.${index}.lorebookTags` as const)} />
          <InlineError message={errors.lorebook?.[index]?.lorebookTags?.message} />
          <Textarea placeholder="Description of Lorebook" {...register(`lorebook.${index}.description` as const)} />
          <InlineError message={errors.lorebook?.[index]?.description?.message} />
          <Textarea
            placeholder="Specific Keywords or Terms"
            {...register(`lorebook.${index}.specificKeywordsOrTerms` as const)}
          />
          <InlineError message={errors.lorebook?.[index]?.specificKeywordsOrTerms?.message} />
          <Controller
            control={control}
            name={`lorebook.${index}.safety`}
            render={({ field }) => (
              <SafetySelect id={`lorebook-safety-${index}`} value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      ),
    },
    background: {
      title: "Background Requests",
      array: backgroundArray,
      add: () => backgroundArray.append(buildBackgroundRequest()),
      editor: (index: number) => (
        <div className="space-y-3 rounded-lg border border-border/60 bg-background  p-4">
          <p className="text-sm font-medium text-foreground">Background {index + 1}</p>
          <Textarea placeholder="Message to Creator" {...register(`background.${index}.messageToCreator` as const)} />
          <InlineError message={errors.background?.[index]?.messageToCreator?.message} />
          <Input
            placeholder="Background Name (or leave blank for creator)"
            {...register(`background.${index}.backgroundName` as const)}
          />
          <Textarea placeholder="Description of Background" {...register(`background.${index}.description` as const)} />
          <InlineError message={errors.background?.[index]?.description?.message} />
          <Input placeholder="Reference Image URL 1" {...register(`background.${index}.referenceUrl1` as const)} />
          <InlineError message={errors.background?.[index]?.referenceUrl1?.message} />
          <Input placeholder="Reference Image URL 2" {...register(`background.${index}.referenceUrl2` as const)} />
          <Input placeholder="Reference Image URL 3" {...register(`background.${index}.referenceUrl3` as const)} />
          <Controller
            control={control}
            name={`background.${index}.safety`}
            render={({ field }) => (
              <SafetySelect id={`background-safety-${index}`} value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      ),
    },
    avatar: {
      title: "Avatar Requests",
      array: avatarArray,
      add: () => avatarArray.append(buildAvatarRequest()),
      editor: (index: number) => (
        <div className="space-y-3 rounded-lg border border-border/60 bg-background  p-4">
          <p className="text-sm font-medium text-foreground">Avatar {index + 1}</p>
          <Textarea placeholder="Message to Creator" {...register(`avatar.${index}.messageToCreator` as const)} />
          <InlineError message={errors.avatar?.[index]?.messageToCreator?.message} />
          <Input
            placeholder="Avatar Name (or leave blank for creator)"
            {...register(`avatar.${index}.avatarName` as const)}
          />
          <Textarea placeholder="Description of Avatar" {...register(`avatar.${index}.description` as const)} />
          <InlineError message={errors.avatar?.[index]?.description?.message} />
          <Input placeholder="Reference Image URL 1" {...register(`avatar.${index}.referenceUrl1` as const)} />
          <InlineError message={errors.avatar?.[index]?.referenceUrl1?.message} />
          <Input placeholder="Reference Image URL 2" {...register(`avatar.${index}.referenceUrl2` as const)} />
          <Input placeholder="Reference Image URL 3" {...register(`avatar.${index}.referenceUrl3` as const)} />
          <Controller
            control={control}
            name={`avatar.${index}.safety`}
            render={({ field }) => (
              <SafetySelect id={`avatar-safety-${index}`} value={field.value} onChange={field.onChange} />
            )}
          />
        </div>
      ),
    },
  } as const

  const currentStep = stepMap[currentStepId]
  const activeItemIndex = useMemo(() => {
    const currentIndex = activeItemIndexByStep[currentStepId]
    if (currentIndex === null || currentIndex >= currentStep.array.fields.length) {
      return null
    }
    return currentIndex
  }, [activeItemIndexByStep, currentStep.array.fields.length, currentStepId])
  const visiblePreviewIndexes =
    activeItemIndex === null
      ? currentStep.array.fields.map((_, index) => index)
      : currentStep.array.fields.map((_, index) => index).filter((index) => index !== activeItemIndex)

  const handleAddItem = () => {
    if (currentStep.array.fields.length >= currentStepLimit) {
      return
    }
    const nextIndex = currentStep.array.fields.length
    currentStep.add()
    setActiveItemIndexByStep((prev) => ({ ...prev, [currentStepId]: nextIndex }))
  }

  const handleDeleteItem = (index: number) => {
    currentStep.array.remove(index)
    setActiveItemIndexByStep((prev) => {
      if (prev[currentStepId] === null) {
        return prev
      }
      if (prev[currentStepId] === index) {
        return { ...prev, [currentStepId]: null }
      }
      if ((prev[currentStepId] ?? 0) > index) {
        return { ...prev, [currentStepId]: (prev[currentStepId] ?? 0) - 1 }
      }
      return prev
    })
  }

  const onFinalSubmit = async (values: CustomRequestFormValues) => {
    setSubmitError("")
    setSubmitSuccess(false)
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/site/custom-package-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId,
          packageId,
          packageTitle,
          packagePrice,
          tokensLabel,
          packageDescription,
          limits,
          requestPayload: values,
        }),
      })

      const result = (await response.json()) as { error?: string; details?: string }
      if (!response.ok) {
        const message = result.error ?? "Unable to submit request."
        const fullMessage = result.details ? `${message} (${result.details})` : message
        setSubmitError(fullMessage)
        toast.error(fullMessage)
        return
      }

      setSubmitSuccess(true)
      toast.success("Your custom package request has been submitted successfully.")
      form.reset({
        character: [],
        persona: [],
        lorebook: [],
        background: [],
        avatar: [],
      })
      setCurrentStepIndex(0)
      setActiveItemIndexByStep({
        character: null,
        persona: null,
        lorebook: null,
        background: null,
        avatar: null,
      })
    } catch {
      setSubmitError("Unable to submit request.")
      toast.error("Unable to submit request.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = async () => {
    const isStepValid = await trigger(currentStepId, { shouldFocus: true })
    if (isStepValid) {
      setActiveItemIndexByStep((prev) => ({ ...prev, [currentStepId]: null }))
      setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1))
    } else if (currentStep.array.fields.length > 0) {
      // Open first item editor so user can immediately see/fix validation issues.
      setActiveItemIndexByStep((prev) => ({ ...prev, [currentStepId]: 0 }))
    }
  }

  const handleBack = () => {
    setActiveItemIndexByStep((prev) => ({ ...prev, [currentStepId]: null }))
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0))
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
      }}
      className="space-y-6"
    >
      <Card className="border-primary/25 bg-linear-to-br from-primary/10 via-card to-card shadow-sm">
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-amber-500 text-white hover:bg-amber-500/90">Custom Package Request</Badge>
            <Badge variant="secondary">{tokensLabel} Tokens</Badge>
          </div>
          <CardTitle className="text-xl">{packageTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{packageDescription}</p>
          <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">${packagePrice}</p>
        </CardHeader>
      </Card>

      <StepIndicator
        currentStepIndex={currentStepIndex}
        totalSteps={STEPS.length}
        stepLabels={STEPS.map((step) => step.label)}
      />

      <div key={currentStepId} className="animate-in fade-in-0 slide-in-from-right-2 duration-300">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">{currentStep.title}</CardTitle>
              <Badge variant="secondary">
                {currentStep.array.fields.length}/{currentStepLimit} item{currentStepLimit === 1 ? "" : "s"}
              </Badge>
            </div>
            {currentStepErrorMessage ? (
              <p className="inline-flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="size-3.5" />
                {currentStepErrorMessage}
              </p>
            ) : currentStep.array.fields.length > 0 && activeItemIndex === null ? (
              <p className="text-xs text-muted-foreground">
                Click <span className="font-medium">Edit</span> to complete item details before moving to the next step.
              </p>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-5">
            {currentStepLimit === 0 ? (
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                This package does not include {currentStepLabel.toLowerCase()} items.
              </div>
            ) : null}

            {currentStepLimit > 0 && currentStep.array.fields.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/70 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                No {currentStepLabel.toLowerCase()} added yet.
              </div>
            ) : null}

            {visiblePreviewIndexes.length > 0 ? (
              <div className="grid gap-3">
                {visiblePreviewIndexes.map((index) => (
                  <Card key={currentStep.array.fields[index].id} className=" bg-background">
                    <CardContent className="flex flex-wrap items-center justify-between gap-2 ">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                          {currentStepLabel} {index + 1}
                        </p>
                        <p className="text-xs text-muted-foreground">Click edit to update details.</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveItemIndexByStep((prev) => ({ ...prev, [currentStepId]: index }))}
                        >
                          <Pencil className="mr-1 size-3.5" />
                          Edit
                        </Button>
                        <Button type="button" variant="destructive" size="sm" onClick={() => handleDeleteItem(index)}>
                          <Trash2 className="mr-1 size-3.5" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : null}

            {activeItemIndex !== null && activeItemIndex < currentStep.array.fields.length ? (
              <div className="space-y-3">
                {currentStep.editor(activeItemIndex)}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    // variant="defa"
                    size="sm"
                    onClick={() => setActiveItemIndexByStep((prev) => ({ ...prev, [currentStepId]: null }))}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : null}

            <div className=" pt-2">
              <div className="flex flex-col items-center gap-2 ">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddItem}
                  disabled={currentStep.array.fields.length >= currentStepLimit}
                  className={"w-full"}
                >
                  <Plus className="mr-1 size-4" />
                  {currentStep.array.fields.length === 0 ? `Add ${currentStepLabel}` : `Add More ${currentStepLabel}`}
                </Button>
                {currentStep.array.fields.length >= currentStepLimit ? (
                  <p className="text-xs text-muted-foreground">Maximum limit reached for this package.</p>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between gap-4 py-2">
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={handleBack}
          disabled={currentStepIndex === 0 || isSubmitting}
        >
          Back
        </Button>
        {currentStepIndex === STEPS.length - 1 ? (
          <Button type="button" size="lg" onClick={handleSubmit(onFinalSubmit)} disabled={isSubmitting || !canAttemptNext}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        ) : (
          <Button type="button" size="lg" onClick={handleNext} disabled={isSubmitting || !canAttemptNext}>
            Next
          </Button>
        )}
      </div>
      {submitError ? (
        <p className="inline-flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="size-4" />
          {submitError}
        </p>
      ) : null}
     
    </form>
  )
}
