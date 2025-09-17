const testHandler = require("../test");
const app = express();
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/.netlify/functions/app", testHandler);

export const handler = serverless(app);
