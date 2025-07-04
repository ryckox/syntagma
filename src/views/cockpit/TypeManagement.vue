<template>
  <div>
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Typen verwalten</h1>
        <p class="mt-2 text-gray-600">Verwalten Sie die Kategorien für Ihre Regelwerke</p>
      </div>
      <button @click="showCreateModal = true" class="btn-primary">
        <PlusIcon class="h-5 w-5 mr-2" />
        Neuer Typ
      </button>
    </div>

    <!-- Types Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="type in rulesetStore.types"
        :key="type.id"
        class="card hover:shadow-lg transition-shadow"
      >
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                class="h-12 w-12 rounded-lg flex items-center justify-center"
                :style="{ backgroundColor: type.color + '20', color: type.color }"
              >
                <component :is="getIcon(type.icon)" class="h-8 w-8" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">{{ type.name }}</h3>
                <p class="text-sm text-gray-500">{{ type.description }}</p>
              </div>
            </div>
            <div class="flex space-x-2">
              <button
                @click="editType(type)"
                class="text-gray-600 hover:text-gray-900"
                title="Bearbeiten"
              >
                <PencilIcon class="h-5 w-5" />
              </button>
              <button
                @click="confirmDelete(type)"
                class="text-red-600 hover:text-red-900"
                title="Löschen"
              >
                <TrashIcon class="h-5 w-5" />
              </button>
            </div>
          </div>
          <div class="mt-4 text-sm text-gray-500">
            Erstellt: {{ formatDate(type.created_at) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeModal"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" @click.stop>
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ showCreateModal ? 'Neuen Typ erstellen' : 'Typ bearbeiten' }}
          </h3>
          <form @submit.prevent="saveType" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input"
                placeholder="z.B. Datenschutz"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
              <textarea
                v-model="form.description"
                class="textarea"
                placeholder="Beschreibung des Typs..."
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Farbe</label>
              <input
                v-model="form.color"
                type="color"
                class="h-10 w-20 border border-gray-300 rounded-md"
              >
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Icon</label>
              <div class="space-y-4">
                <!-- Selected Icon Preview -->
                <div class="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <div class="w-8 h-8 flex items-center justify-center">
                    <component :is="getIcon(form.icon)" class="w-6 h-6 text-gray-600" />
                  </div>
                  <span class="text-sm font-medium text-gray-700">
                    {{ getIconLabel(form.icon) }}
                  </span>
                </div>
                
                <!-- Icon Categories -->
                <div class="space-y-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  <!-- Sicherheit & Datenschutz -->
                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sicherheit & Datenschutz</h4>
                    <div class="grid grid-cols-6 gap-2">
                      <icon-option icon="shield-check" label="Schutzschild" />
                      <icon-option icon="shield-exclamation" label="Sicherheitswarnung" />
                      <icon-option icon="lock-closed" label="Schloss" />
                      <icon-option icon="key" label="Schlüssel" />
                      <icon-option icon="eye" label="Überwachung" />
                      <icon-option icon="eye-slash" label="Privatsphäre" />
                      <icon-option icon="fingerprint" label="Biometrie" />
                      <icon-option icon="exclamation-circle" label="Warnung" />
                      <icon-option icon="check-badge" label="Zertifikat" />
                    </div>
                  </div>
                  
                  <!-- IT & Computer -->
                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">IT & Computer</h4>
                    <div class="grid grid-cols-6 gap-2">
                      <icon-option icon="computer" label="Computer" />
                      <icon-option icon="server" label="Server" />
                      <icon-option icon="cpu-chip" label="Prozessor" />
                      <icon-option icon="wifi" label="Netzwerk" />
                      <icon-option icon="globe" label="Internet" />
                      <icon-option icon="cloud" label="Cloud" />
                      <icon-option icon="command-line" label="Terminal" />
                      <icon-option icon="code-bracket" label="Code" />
                      <icon-option icon="bug-ant" label="Fehler" />
                      <icon-option icon="tv" label="Monitor" />
                      <icon-option icon="device-phone-mobile" label="Handy" />
                      <icon-option icon="printer" label="Drucker" />
                      <icon-option icon="camera" label="Kamera" />
                      <icon-option icon="video-camera" label="Video" />
                      <icon-option icon="qr-code" label="QR-Code" />
                      <icon-option icon="signal" label="Signal" />
                    </div>
                  </div>
                  
                  <!-- Dokumente & Verwaltung -->
                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dokumente & Verwaltung</h4>
                    <div class="grid grid-cols-6 gap-2">
                      <icon-option icon="document" label="Dokument" />
                      <icon-option icon="document-text" label="Text-Dokument" />
                      <icon-option icon="document-check" label="Geprüftes Dokument" />
                      <icon-option icon="folder" label="Ordner" />
                      <icon-option icon="archive-box" label="Archiv" />
                      <icon-option icon="clipboard-list" label="Checkliste" />
                      <icon-option icon="book-open" label="Handbuch" />
                      <icon-option icon="clipboard" label="Zwischenablage" />
                      <icon-option icon="paper-clip" label="Anhang" />
                      <icon-option icon="inbox" label="Posteingang" />
                      <icon-option icon="table-cells" label="Tabelle" />
                      <icon-option icon="list-bullet" label="Liste" />
                      <icon-option icon="squares-2x2" label="Raster" />
                      <icon-option icon="bars-3" label="Menü" />
                    </div>
                  </div>
                  
                  <!-- Personen & Organisation -->
                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Personen & Organisation</h4>
                    <div class="grid grid-cols-6 gap-2">
                      <icon-option icon="user" label="Person" />
                      <icon-option icon="users" label="Mehrere Personen" />
                      <icon-option icon="user-group" label="Team" />
                      <icon-option icon="identification" label="Ausweis" />
                      <icon-option icon="building-office" label="Büro" />
                      <icon-option icon="academic-cap" label="Bildung" />
                      <icon-option icon="home" label="Zuhause" />
                      <icon-option icon="home-modern" label="Modernes Haus" />
                      <icon-option icon="building-library" label="Bibliothek" />
                      <icon-option icon="briefcase" label="Aktenkoffer" />
                    </div>
                  </div>
                  
                  <!-- Recht & Compliance -->
                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Recht & Compliance</h4>
                    <div class="grid grid-cols-6 gap-2">
                      <icon-option icon="scale" label="Recht" />
                      <icon-option icon="banknotes" label="Geld" />
                      <icon-option icon="hand-raised" label="Eid" />
                      <icon-option icon="credit-card" label="Kreditkarte" />
                      <icon-option icon="currency-euro" label="Euro" />
                      <icon-option icon="calculator" label="Rechner" />
                      <icon-option icon="shopping-cart" label="Einkaufswagen" />
                      <icon-option icon="shopping-bag" label="Einkaufstasche" />
                      <icon-option icon="receipt-percent" label="Rabatt" />
                    </div>
                  </div>
                  
                  <!-- Prozesse & Workflow -->
                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Prozesse & Workflow</h4>
                    <div class="grid grid-cols-6 gap-2">
                      <icon-option icon="cog" label="Einstellungen" />
                      <icon-option icon="arrow-path" label="Zyklus" />
                      <icon-option icon="clock" label="Zeit" />
                      <icon-option icon="calendar" label="Termin" />
                      <icon-option icon="check-circle" label="Erledigt" />
                      <icon-option icon="play-circle" label="Start" />
                      <icon-option icon="wrench-screwdriver" label="Werkzeug" />
                      <icon-option icon="cube" label="Block" />
                      <icon-option icon="arrow-right" label="Weiter" />
                      <icon-option icon="arrow-left" label="Zurück" />
                      <icon-option icon="plus-circle" label="Hinzufügen" />
                      <icon-option icon="minus" label="Entfernen" />
                    </div>
                  </div>
                  
                  <!-- Kommunikation -->
                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Kommunikation</h4>
                    <div class="grid grid-cols-6 gap-2">
                      <icon-option icon="chat" label="Chat" />
                      <icon-option icon="phone" label="Telefon" />
                      <icon-option icon="envelope" label="E-Mail" />
                      <icon-option icon="megaphone" label="Ankündigung" />
                      <icon-option icon="speaker-wave" label="Audio" />
                      <icon-option icon="bell" label="Benachrichtigung" />
                      <icon-option icon="at-symbol" label="E-Mail Symbol" />
                      <icon-option icon="hashtag" label="Hashtag" />
                      <icon-option icon="link" label="Link" />
                      <icon-option icon="paper-airplane" label="Senden" />
                    </div>
                  </div>
                  
                  <!-- Business & Analytics -->
                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Business & Analytics</h4>
                    <div class="grid grid-cols-6 gap-2">
                      <icon-option icon="presentation-chart-bar" label="Präsentation" />
                      <icon-option icon="chart-bar" label="Diagramm" />
                      <icon-option icon="map" label="Karte" />
                      <icon-option icon="cursor-arrow-rays" label="Cursor" />
                      <icon-option icon="magnifying-glass" label="Suche" />
                    </div>
                  </div>
                  
                  <!-- Sonstiges -->
                  <div>
                    <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sonstiges</h4>
                    <div class="grid grid-cols-6 gap-2">
                      <icon-option icon="heart" label="Gesundheit" />
                      <icon-option icon="star" label="Favorit" />
                      <icon-option icon="bolt" label="Energie" />
                      <icon-option icon="fire" label="Kritisch" />
                      <icon-option icon="beaker" label="Forschung" />
                      <icon-option icon="rocket" label="Innovation" />
                      <icon-option icon="trophy" label="Erfolg" />
                      <icon-option icon="gift" label="Benefit" />
                      <icon-option icon="light-bulb" label="Idee" />
                      <icon-option icon="musical-note" label="Musik" />
                      <icon-option icon="paint-brush" label="Design" />
                      <icon-option icon="flag" label="Flagge" />
                      <icon-option icon="tag" label="Markierung" />
                      <icon-option icon="lifebuoy" label="Hilfe" />
                      <icon-option icon="question-mark-circle" label="Frage" />
                      <icon-option icon="information-circle" label="Information" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-end space-x-4 pt-4">
              <button
                type="button"
                @click="closeModal"
                class="btn-outline"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                class="btn-primary"
                :disabled="isLoading"
              >
                {{ isLoading ? 'Speichern...' : 'Speichern' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <div
      v-if="showDeleteModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="showDeleteModal = false"
    >
      <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div class="mt-3 text-center">
          <ExclamationTriangleIcon class="mx-auto h-16 w-16 text-red-600" />
          <h3 class="text-lg font-medium text-gray-900 mt-5">Typ löschen</h3>
          <div class="mt-2 px-7 py-3">
            <p class="text-sm text-gray-500">
              Sind Sie sicher, dass Sie den Typ "{{ typeToDelete?.name }}" löschen möchten?
            </p>
          </div>
          <div class="flex justify-center space-x-4 px-4 py-3">
            <button @click="showDeleteModal = false" class="btn-outline">
              Abbrechen
            </button>
            <button @click="deleteType" class="btn-danger" :disabled="isDeleting">
              {{ isDeleting ? 'Löschen...' : 'Löschen' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, defineComponent, h } from 'vue'
import { useRulesetStore, type RulesetType } from '@/stores/ruleset'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  // Sicherheit & Datenschutz
  ShieldCheckIcon,
  ShieldExclamationIcon,
  LockClosedIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  FingerPrintIcon,
  // IT & Computer
  ComputerDesktopIcon,
  ServerIcon,
  CpuChipIcon,
  WifiIcon,
  GlobeAltIcon,
  CloudIcon,
  // Dokumente & Verwaltung
  DocumentIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  FolderIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  // Personen & Organisation
  UserGroupIcon,
  UserIcon,
  UsersIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  // Recht & Compliance
  ScaleIcon,
  BanknotesIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  HandRaisedIcon,
  // Prozesse & Workflow
  Cog6ToothIcon,
  ArrowPathIcon,
  ClockIcon,
  CalendarIcon,
  CheckCircleIcon,
  PlayCircleIcon,
  // Kommunikation
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  MegaphoneIcon,
  SpeakerWaveIcon,
  // Sonstiges
  HeartIcon,
  StarIcon,
  BoltIcon,
  FireIcon,
  BeakerIcon,
  RocketLaunchIcon,
  TrophyIcon,
  GiftIcon,
  // Weitere Business Icons
  PresentationChartBarIcon,
  BriefcaseIcon,
  CreditCardIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  TableCellsIcon,
  MapIcon,
  HomeIcon,
  HomeModernIcon,
  BuildingLibraryIcon,
  CubeIcon,
  WrenchScrewdriverIcon,
  LightBulbIcon,
  MagnifyingGlassIcon,
  PrinterIcon,
  DevicePhoneMobileIcon,
  TvIcon,
  CameraIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  CursorArrowRaysIcon,
  SignalIcon,
  BellIcon,
  FlagIcon,
  TagIcon,
  HashtagIcon,
  AtSymbolIcon,
  LinkIcon,
  QrCodeIcon,
  CommandLineIcon,
  WindowIcon,
  CodeBracketIcon,
  VariableIcon,
  BugAntIcon,
  ShoppingCartIcon,
  ShoppingBagIcon,
  ReceiptPercentIcon,
  CalculatorIcon,
  ClipboardIcon,
  PaperClipIcon,
  PaperAirplaneIcon,
  InboxIcon,
  LifebuoyIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  MinusIcon,
  PlusCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  Bars3Icon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/vue/24/outline'

const rulesetStore = useRulesetStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const isLoading = ref(false)
const isDeleting = ref(false)
const typeToDelete = ref<RulesetType | null>(null)
const editingType = ref<RulesetType | null>(null)

const form = reactive({
  name: '',
  description: '',
  color: '#3b82f6',
  icon: 'shield-check'
})

onMounted(async () => {
  await rulesetStore.loadTypes()
})

function getIcon(iconName: string) {
  const icons: Record<string, any> = {
    // Sicherheit & Datenschutz
    'shield-check': ShieldCheckIcon,
    'shield-exclamation': ShieldExclamationIcon,
    'lock-closed': LockClosedIcon,
    'key': KeyIcon,
    'eye': EyeIcon,
    'eye-slash': EyeSlashIcon,
    'fingerprint': FingerPrintIcon,
    
    // IT & Computer
    'computer': ComputerDesktopIcon,
    'server': ServerIcon,
    'cpu-chip': CpuChipIcon,
    'wifi': WifiIcon,
    'globe': GlobeAltIcon,
    'cloud': CloudIcon,
    'command-line': CommandLineIcon,
    'window': WindowIcon,
    'code-bracket': CodeBracketIcon,
    'variable': VariableIcon,
    'bug-ant': BugAntIcon,
    'signal': SignalIcon,
    'tv': TvIcon,
    'camera': CameraIcon,
    'video-camera': VideoCameraIcon,
    'device-phone-mobile': DevicePhoneMobileIcon,
    'printer': PrinterIcon,
    'qr-code': QrCodeIcon,
    
    // Dokumente & Verwaltung
    'document': DocumentIcon,
    'document-text': DocumentTextIcon,
    'document-check': DocumentCheckIcon,
    'folder': FolderIcon,
    'archive-box': ArchiveBoxIcon,
    'clipboard-list': ClipboardDocumentListIcon,
    'book-open': BookOpenIcon,
    'clipboard': ClipboardIcon,
    'paper-clip': PaperClipIcon,
    'paper-airplane': PaperAirplaneIcon,
    'inbox': InboxIcon,
    'table-cells': TableCellsIcon,
    'list-bullet': ListBulletIcon,
    'squares-2x2': Squares2X2Icon,
    'bars-3': Bars3Icon,
    
    // Personen & Organisation
    'user-group': UserGroupIcon,
    'user': UserIcon,
    'users': UsersIcon,
    'identification': IdentificationIcon,
    'building-office': BuildingOfficeIcon,
    'academic-cap': AcademicCapIcon,
    'home': HomeIcon,
    'home-modern': HomeModernIcon,
    'building-library': BuildingLibraryIcon,
    'briefcase': BriefcaseIcon,
    
    // Recht & Compliance
    'scale': ScaleIcon,
    'banknotes': BanknotesIcon,
    'exclamation-circle': ExclamationCircleIcon,
    'check-badge': CheckBadgeIcon,
    'hand-raised': HandRaisedIcon,
    'credit-card': CreditCardIcon,
    'currency-euro': CurrencyEuroIcon,
    'calculator': CalculatorIcon,
    'shopping-cart': ShoppingCartIcon,
    'shopping-bag': ShoppingBagIcon,
    'receipt-percent': ReceiptPercentIcon,
    
    // Prozesse & Workflow
    'cog': Cog6ToothIcon,
    'arrow-path': ArrowPathIcon,
    'clock': ClockIcon,
    'calendar': CalendarIcon,
    'check-circle': CheckCircleIcon,
    'play-circle': PlayCircleIcon,
    'wrench-screwdriver': WrenchScrewdriverIcon,
    'cube': CubeIcon,
    'arrow-right': ArrowRightIcon,
    'arrow-left': ArrowLeftIcon,
    'arrow-up': ArrowUpIcon,
    'arrow-down': ArrowDownIcon,
    'chevron-right': ChevronRightIcon,
    'chevron-left': ChevronLeftIcon,
    'chevron-up': ChevronUpIcon,
    'chevron-down': ChevronDownIcon,
    'plus-circle': PlusCircleIcon,
    'minus': MinusIcon,
    'x-mark': XMarkIcon,
    
    // Kommunikation
    'chat': ChatBubbleLeftRightIcon,
    'phone': PhoneIcon,
    'envelope': EnvelopeIcon,
    'megaphone': MegaphoneIcon,
    'speaker-wave': SpeakerWaveIcon,
    'bell': BellIcon,
    'at-symbol': AtSymbolIcon,
    'hashtag': HashtagIcon,
    'link': LinkIcon,
    
    // Business & Analytics
    'presentation-chart-bar': PresentationChartBarIcon,
    'chart-bar': ChartBarIcon,
    'map': MapIcon,
    'cursor-arrow-rays': CursorArrowRaysIcon,
    'magnifying-glass': MagnifyingGlassIcon,
    
    // Sonstiges
    'heart': HeartIcon,
    'star': StarIcon,
    'bolt': BoltIcon,
    'fire': FireIcon,
    'beaker': BeakerIcon,
    'rocket': RocketLaunchIcon,
    'trophy': TrophyIcon,
    'gift': GiftIcon,
    'light-bulb': LightBulbIcon,
    'musical-note': MusicalNoteIcon,
    'paint-brush': PaintBrushIcon,
    'flag': FlagIcon,
    'tag': TagIcon,
    'lifebuoy': LifebuoyIcon,
    'question-mark-circle': QuestionMarkCircleIcon,
    'information-circle': InformationCircleIcon,
    
    // Legacy-Mapping für bestehende Daten
    'security': ShieldCheckIcon,
    'handshake': UserGroupIcon,
    'default': DocumentIcon
  }
  return icons[iconName] || icons.default
}

function getIconLabel(iconName: string) {
  const labels: Record<string, string> = {
    // Sicherheit & Datenschutz
    'shield-check': 'Schutzschild',
    'shield-exclamation': 'Sicherheitswarnung',
    'lock-closed': 'Schloss',
    'key': 'Schlüssel',
    'eye': 'Überwachung',
    'eye-slash': 'Privatsphäre',
    'fingerprint': 'Biometrie',
    
    // IT & Computer
    'computer': 'Computer',
    'server': 'Server',
    'cpu-chip': 'Prozessor',
    'wifi': 'Netzwerk',
    'globe': 'Internet',
    'cloud': 'Cloud',
    'command-line': 'Terminal',
    'window': 'Fenster',
    'code-bracket': 'Code',
    'variable': 'Variable',
    'bug-ant': 'Fehler',
    'signal': 'Signal',
    'tv': 'Monitor',
    'camera': 'Kamera',
    'video-camera': 'Video',
    'device-phone-mobile': 'Handy',
    'printer': 'Drucker',
    'qr-code': 'QR-Code',
    
    // Dokumente & Verwaltung
    'document': 'Dokument',
    'document-text': 'Text-Dokument',
    'document-check': 'Geprüftes Dokument',
    'folder': 'Ordner',
    'archive-box': 'Archiv',
    'clipboard-list': 'Checkliste',
    'book-open': 'Handbuch',
    'clipboard': 'Zwischenablage',
    'paper-clip': 'Anhang',
    'paper-airplane': 'Senden',
    'inbox': 'Posteingang',
    'table-cells': 'Tabelle',
    'list-bullet': 'Liste',
    'squares-2x2': 'Raster',
    'bars-3': 'Menü',
    
    // Personen & Organisation
    'user-group': 'Team',
    'user': 'Person',
    'users': 'Mehrere Personen',
    'identification': 'Ausweis',
    'building-office': 'Büro',
    'academic-cap': 'Bildung',
    'home': 'Zuhause',
    'home-modern': 'Modernes Haus',
    'building-library': 'Bibliothek',
    'briefcase': 'Aktenkoffer',
    
    // Recht & Compliance
    'scale': 'Recht',
    'banknotes': 'Geld',
    'exclamation-circle': 'Warnung',
    'check-badge': 'Zertifikat',
    'hand-raised': 'Eid',
    'credit-card': 'Kreditkarte',
    'currency-euro': 'Euro',
    'calculator': 'Rechner',
    'shopping-cart': 'Einkaufswagen',
    'shopping-bag': 'Einkaufstasche',
    'receipt-percent': 'Rabatt',
    
    // Prozesse & Workflow
    'cog': 'Einstellungen',
    'arrow-path': 'Zyklus',
    'clock': 'Zeit',
    'calendar': 'Termin',
    'check-circle': 'Erledigt',
    'play-circle': 'Start',
    'wrench-screwdriver': 'Werkzeug',
    'cube': 'Block',
    'arrow-right': 'Rechts',
    'arrow-left': 'Links',
    'arrow-up': 'Hoch',
    'arrow-down': 'Runter',
    'chevron-right': 'Weiter',
    'chevron-left': 'Zurück',
    'chevron-up': 'Aufklappen',
    'chevron-down': 'Zuklappen',
    'plus-circle': 'Hinzufügen',
    'minus': 'Entfernen',
    'x-mark': 'Schließen',
    
    // Kommunikation
    'chat': 'Chat',
    'phone': 'Telefon',
    'envelope': 'E-Mail',
    'megaphone': 'Ankündigung',
    'speaker-wave': 'Audio',
    'bell': 'Benachrichtigung',
    'at-symbol': 'E-Mail Symbol',
    'hashtag': 'Hashtag',
    'link': 'Link',
    
    // Business & Analytics
    'presentation-chart-bar': 'Präsentation',
    'chart-bar': 'Diagramm',
    'map': 'Karte',
    'cursor-arrow-rays': 'Cursor',
    'magnifying-glass': 'Suche',
    
    // Sonstiges
    'heart': 'Gesundheit',
    'star': 'Favorit',
    'bolt': 'Energie',
    'fire': 'Kritisch',
    'beaker': 'Forschung',
    'rocket': 'Innovation',
    'trophy': 'Erfolg',
    'gift': 'Benefit',
    'light-bulb': 'Idee',
    'musical-note': 'Musik',
    'paint-brush': 'Design',
    'flag': 'Flagge',
    'tag': 'Markierung',
    'lifebuoy': 'Hilfe',
    'question-mark-circle': 'Frage',
    'information-circle': 'Information',
    
    // Legacy
    'security': 'Sicherheit',
    'handshake': 'Kooperation',
  }
  return labels[iconName] || iconName
}

// Inline IconOption Komponente
const IconOption = defineComponent({
  props: {
    icon: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    }
  },
  setup(props) {
    return () => h('button', {
      type: 'button',
      class: [
        'w-10 h-10 flex items-center justify-center rounded-lg border-2 transition-all duration-200',
        'hover:border-blue-300 hover:bg-blue-50 hover:scale-110',
        props.icon === form.icon 
          ? 'border-blue-500 bg-blue-100 text-blue-600 shadow-md' 
          : 'border-gray-200 text-gray-600 hover:border-gray-300'
      ],
      title: props.label,
      onClick: () => {
        form.icon = props.icon
      }
    }, [
      h(getIcon(props.icon), { class: 'w-5 h-5' })
    ])
  }
})

function editType(type: RulesetType) {
  editingType.value = type
  form.name = type.name
  form.description = type.description
  form.color = type.color
  form.icon = type.icon
  showEditModal.value = true
}

function resetForm() {
  form.name = ''
  form.description = ''
  form.color = '#3b82f6'
  form.icon = 'shield-check'
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  editingType.value = null
  resetForm()
}

async function saveType() {
  isLoading.value = true
  
  try {
    if (showCreateModal.value) {
      const result = await rulesetStore.createType({
        name: form.name,
        description: form.description,
        color: form.color,
        icon: form.icon
      })
      
      if (result.success) {
        closeModal()
      } else {
        alert('Fehler: ' + result.error)
      }
    } else if (showEditModal.value && editingType.value) {
      const result = await rulesetStore.updateType(editingType.value.id, {
        name: form.name,
        description: form.description,
        color: form.color,
        icon: form.icon
      })
      
      if (result.success) {
        closeModal()
      } else {
        alert('Fehler: ' + result.error)
      }
    }
  } finally {
    isLoading.value = false
  }
}

function confirmDelete(type: RulesetType) {
  typeToDelete.value = type
  showDeleteModal.value = true
}

async function deleteType() {
  if (!typeToDelete.value) return
  
  isDeleting.value = true
  
  try {
    const result = await rulesetStore.deleteType(typeToDelete.value.id)
    
    if (result.success) {
      showDeleteModal.value = false
      typeToDelete.value = null
    } else {
      alert('Fehler: ' + result.error)
    }
  } finally {
    isDeleting.value = false
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>
