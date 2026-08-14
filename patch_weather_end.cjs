const fs = require('fs');
let code = fs.readFileSync('src/components/WeatherPage.tsx', 'utf8');

code = code.replace(
  `        </motion.div>
      </div>
      </div>
    </div>`,
  `        </motion.div>
      </div>
    </div>`
);

fs.writeFileSync('src/components/WeatherPage.tsx', code);
