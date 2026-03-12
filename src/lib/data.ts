export interface Video {
  id: string
  title: string
  description?: string
  youtube_id?: string
  video_url?: string
  videoUrl?: string
  facebook_url?: string
  thumbnail?: string
  thumbnail_url?: string
  category?: string
  is_live?: boolean
  duration?: number
  createdAt?: string
}

export interface Settings {
  site_name?: string
  slider_interval?: number
  youtube_live_url?: string
  facebook_live_url?: string
  tv_program_queue?: string[]
}

export interface Slide {
  id: string
  imageUrl: string
  title?: string
}

export interface PrayerRequest {
  id: string
  name: string
  request: string
  createdAt: string
  isPublic: boolean
}

export interface Testimony {
  id: string
  name: string
  testimony: string
  createdAt: string
  isPublic: boolean
}

// ========== VIDEO SCHEDULING TYPES ==========

export interface VideoSchedule {
  id: string
  video_id: string
  order_index: number
  scheduled_time?: string
  category?: string
  is_active: boolean
  video?: Video
  created_at: string
}

export interface PlaybackState {
  current_video_id: string | null
  current_video_index: number
  started_at: string
  is_playing: boolean
  schedule_type: 'sequential' | 'time-based' | 'category'
  current_category?: string
}

// ========== PRECIOUSMINDS LEARNING TYPES ==========

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  xp: number
  streak: number
  longestStreak: number
  level: number
  badges: string[]
  completedLessons: string[]
  completedCourses: string[]
  currentCourse?: string
  createdAt: string
  lastActive: string
}

export interface Course {
  id: string
  title: string
  description: string
  category: CourseCategory
  image?: string
  lessons: string[] // lesson ids
  totalXP: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  order: number
  isPublished: boolean
  createdAt: string
}

export type CourseCategory = 
  | 'math-foundations'
  | 'algebra'
  | 'programming'
  | 'data-science'
  | 'science'
  | 'logic'
  | 'everyday-math'
  | 'technology'
  | 'advanced-math'
  | 'puzzles'
  | 'bible'
  | 'theology'

export interface Lesson {
  id: string
  courseId: string
  title: string
  description?: string
  order: number
  steps: LessonStep[]
  xpReward: number
  estimatedMinutes: number
  prerequisites?: string[]
  isPublished: boolean
}

export interface LessonStep {
  id: string
  type: StepType
  content: StepContent
  order: number
}

export type StepType = 
  | 'text' 
  | 'image' 
  | 'video'
  | 'math'
  | 'interactive'
  | 'multiple-choice'
  | 'multiple-select'
  | 'fill-blank'
  | 'drag-drop'
  | 'drag-order'
  | 'slider'
  | 'code'
  | 'code-execute'
  | 'simulation'
  | 'matching'
  | 'sorting'
  | 'drawing'
  | 'graph'

export interface StepContent {
  // Text content
  text?: string
  title?: string
  
  // Image/Video
  imageUrl?: string
  videoUrl?: string
  
  // Math (LaTeX)
  latex?: string
  mathDisplay?: 'inline' | 'block'
  
  // Multiple Choice/Select
  question?: string
  options?: QuestionOption[]
  correctAnswer?: string | string[]
  explanation?: string
  hint?: string
  
  // Fill in the blank
  blanks?: BlankItem[]
  
  // Drag and Drop
  dragItems?: DragItem[]
  dropZones?: DropZone[]
  
  // Slider
  sliderConfig?: SliderConfig
  
  // Code
  code?: string
  language?: 'python' | 'javascript' | 'html' | 'css'
  codeQuestion?: string
  expectedOutput?: string
  starterCode?: string
  
  // Simulation
  simulationType?: 'physics' | 'circuit' | 'graph' | 'geometry' | 'probability'
  simulationConfig?: SimulationConfig
  
  // Matching
  matchingPairs?: MatchingPair[]
  
  // Sorting
  sortItems?: SortItem[]
  correctOrder?: string[]
  
  // Interactive
  interactiveType?: 'click' | 'hover' | 'build'
  interactiveConfig?: InteractiveConfig
  
  // Graph
  graphConfig?: GraphConfig
}

export interface QuestionOption {
  id: string
  text: string
  image?: string
  isCorrect?: boolean
  feedback?: string
}

export interface BlankItem {
  id: string
  correctAnswer: string
  acceptableAnswers?: string[]
  placeholder?: string
}

export interface DragItem {
  id: string
  content: string
  type: 'text' | 'image' | 'math'
  correctZone?: string
}

export interface DropZone {
  id: string
  label?: string
  acceptsMultiple?: boolean
}

export interface SliderConfig {
  min: number
  max: number
  step: number
  defaultValue: number
  correctValue?: number
  correctRange?: { min: number; max: number }
  unit?: string
  label?: string
}

export interface SimulationConfig {
  // Physics
  gravity?: number
  friction?: number
  objects?: PhysicsObject[]
  
  // Circuit
  components?: CircuitComponent[]
  
  // Graph
  graphType?: 'line' | 'bar' | 'scatter' | 'function'
  dataPoints?: { x: number; y: number }[]
  function?: string
  
  // Geometry
  shapes?: GeometryShape[]
  
  // Probability
  probabilityType?: 'coin' | 'dice' | 'card' | 'custom'
  trials?: number
}

export interface PhysicsObject {
  id: string
  type: 'circle' | 'rectangle' | 'polygon'
  x: number
  y: number
  width?: number
  height?: number
  radius?: number
  mass?: number
  velocity?: { x: number; y: number }
  isStatic?: boolean
  color?: string
}

export interface CircuitComponent {
  id: string
  type: 'battery' | 'resistor' | 'capacitor' | 'switch' | 'led' | 'wire'
  x: number
  y: number
  value?: number
  connections?: string[]
}

export interface GeometryShape {
  id: string
  type: 'point' | 'line' | 'circle' | 'triangle' | 'rectangle' | 'polygon'
  points?: { x: number; y: number }[]
  color?: string
  draggable?: boolean
  label?: string
}

export interface MatchingPair {
  left: { id: string; content: string }
  right: { id: string; content: string }
}

export interface SortItem {
  id: string
  content: string
  correctPosition: number
}

export interface InteractiveConfig {
  elementType: 'button' | 'shape' | 'card' | 'node'
  elements: InteractiveElement[]
  correctSequence?: string[]
  feedback?: { correct: string; incorrect: string }
}

export interface InteractiveElement {
  id: string
  content: string
  x?: number
  y?: number
  width?: number
  height?: number
  color?: string
  onClick?: string
}

export interface GraphConfig {
  type: 'function' | 'data' | 'interactive'
  xAxis?: { label: string; min: number; max: number }
  yAxis?: { label: string; min: number; max: number }
  functions?: GraphFunction[]
  points?: GraphPoint[]
  interactiveMode?: 'plot' | 'draw' | 'transform'
}

export interface GraphFunction {
  id: string
  expression: string
  color: string
  visible: boolean
}

export interface GraphPoint {
  id: string
  x: number
  y: number
  label?: string
  color?: string
  draggable?: boolean
}

// ========== PROGRESS & GAMIFICATION ==========

export interface LessonProgress {
  lessonId: string
  userId: string
  status: 'not-started' | 'in-progress' | 'completed'
  currentStep: number
  completedSteps: string[]
  xpEarned: number
  timeSpent: number
  attempts: number
  startedAt?: string
  completedAt?: string
}

export interface UserAnswer {
  stepId: string
  userId: string
  answer: string | string[] | Record<string, string>
  isCorrect: boolean
  attempts: number
  timeTaken: number
  timestamp: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  xpReward: number
  requirement: BadgeRequirement
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface BadgeRequirement {
  type: 'xp' | 'streak' | 'lessons' | 'courses' | 'perfect-score' | 'speed'
  value: number
  courseId?: string
}

export interface LeaderboardEntry {
  userId: string
  userName: string
  avatar?: string
  xp: number
  streak: number
  level: number
  rank: number
}

export interface DailyChallenge {
  id: string
  title: string
  description: string
  type: 'lesson' | 'quiz' | 'practice'
  xpReward: number
  expiresAt: string
  completedBy: string[]
}

export interface Notification {
  id: string
  userId: string
  type: 'badge' | 'streak' | 'xp' | 'course-complete' | 'daily-challenge' | 'announcement'
  title: string
  message: string
  read: boolean
  createdAt: string
}
