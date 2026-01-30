# Random Activity Generator

A web application that generates random activities and tasks to help you decide what to do. Features secure cross-device syncing, category management, and a clean, modern interface with theme customization.

## ✨ Features

- 🎲 **Random Activity Selection** - Pick random activities from customizable categories
- 🔐 **Secure Authentication** - Firebase authentication with Google Sign-In and Email/Password
- ☁️ **Cross-Device Syncing** - Sync your activities and preferences across all your devices
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Theme Customization** - Multiple themes including light, dark, and color variants
- 📝 **Activity Management** - Add, edit, and organize activities by category
- 🎯 **Category Filtering** - Filter activities by specific categories or use all
- 🔒 **Privacy First** - Option to use offline without syncing
- ⚡ **Real-time Updates** - Changes sync instantly across devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account (for syncing features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hFire24/random-activity-generator.git
cd random-activity-generator
```

2. Install dependencies:
```bash
npm install
```

3. Configure Firebase (for syncing features):
   - Copy `firebase-config.example.js` to `firebase-config.js`
   - Follow the [SETUP.md](SETUP.md) guide to create your Firebase project and get your config
   - Update `firebase-config.js` with your Firebase credentials

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Build and deploy to GitHub Pages

### Project Structure

```
random-activity-generator/
├── src/
│   └── react/           # React components
│       ├── Activity.jsx        # Main activity display
│       ├── App.jsx            # Main app component with routing
│       ├── CategoryManager.jsx # Category management
│       ├── Login.jsx          # Authentication
│       ├── ManagePage.jsx     # Activity management
│       ├── SelectScreen.jsx   # Category selection
│       └── ...
├── public/              # Static assets
├── css/                 # Stylesheets
├── firebase-config.js   # Firebase configuration (not in repo)
├── SETUP.md            # Firebase setup guide
├── SYNCING.md          # Syncing documentation
└── vite.config.js      # Vite configuration
```

## 🔧 Configuration

### Firebase Setup

To enable cross-device syncing and authentication:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password and/or Google Sign-In)
3. Create a Firestore database
4. Add security rules (see [SETUP.md](SETUP.md))
5. Copy your Firebase config to `firebase-config.js`

For detailed instructions, see [SETUP.md](SETUP.md).

### Offline Mode

The app can be used without Firebase by using the offline mode. Your activities will be stored locally in your browser's localStorage.

## 📖 Usage

### Adding Activities

1. Click the "Login" button (optional, for syncing)
2. Navigate to the "Manage" page
3. Click "Add Activity" or use the category manager
4. Enter your activity details and category
5. Save your changes

### Generating Random Activities

1. Select a category filter or use "All Categories"
2. Click "Get Activity" to generate a random selection
3. Refresh to get a different activity

### Managing Categories

1. Go to the Manage page
2. Use the Category Manager to:
   - Create new categories
   - Edit existing categories
   - Delete unused categories
   - View activity counts per category

## 🔒 Privacy & Security

- User data is secured with Firebase security rules
- Each user can only access their own activities
- Authentication is required for syncing features
- Offline mode available for privacy-conscious users
- See [PRIVACY-POLICY.md](PRIVACY-POLICY.md) for details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

[Add your contact information or link to issues page]

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Vite](https://vitejs.dev/)
- Authentication & Database by [Firebase](https://firebase.google.com/)
- Routing by [React Router](https://reactrouter.com/)
- Markdown rendering by [react-markdown](https://github.com/remarkjs/react-markdown)

---

For setup instructions, see [SETUP.md](SETUP.md).  
For syncing information, see [SYNCING.md](SYNCING.md).
