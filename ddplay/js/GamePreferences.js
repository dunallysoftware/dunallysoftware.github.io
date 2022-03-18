
export const PREFERENCE_KEYS =
{
  "SPEAK_SPANISH_VOLUME" : "speak_spanish_volume",
  "SOUND_EFFECTS_VOLUME" : "sound_effects_volume",
  "MUSIC_VOLUME" : "music_volume"
};

export const PREFERENCE_DEFAULTS =
{
  "SPEAK_SPANISH_VOLUME" : 10.0,
  "SOUND_EFFECTS_VOLUME" : 4.0,
  "MUSIC_VOLUME" : 3.0
}

export default class GamePreferences {

  subscribers = [];

  addSubscriber=function(myObject, myFunction)
  {
    this.subscribers.push(new Subscriber(myObject, myFunction));
  }

  publishUpdates()
  {
    for (let s=0;s<this.subscribers.length;s++)
    {
      let subscriberObject = this.subscribers[s].subscriberObject;
      let subscriberFunction = this.subscribers[s].subscriberFunction;
      //subscriberObject.
      subscriberFunction(subscriberObject);
    }
  }


  populateScreen=function()
  {
    this.setValueElement("spanishSpeechVolume", "SPEAK_SPANISH_VOLUME");
    this.setValueElement("soundEffectsVolume", "SOUND_EFFECTS_VOLUME");
    this.setValueElement("musicVolume", "MUSIC_VOLUME");
  }

  setCheckboxElement=function(elementName, storageName, defaultValue)
  {
    let checkBoxValue=defaultValue;
    let checkBoxString=localStorage.getItem(storageName);
    if (checkBoxString) checkBoxValue=eval(checkBoxString);
    document.getElementById(elementName).checked=checkBoxValue;
  }

  setValueElement=function(elementName,keyName)
  {
    document.getElementById(elementName).value=this.getValue(keyName);
    this.publishUpdates();
  }

  checkBoxUpdate = function(element)
  {
    if (element.id == "spanishSpeech")
    {
      localStorage.setItem(PREFERENCE_KEYS.SPEAK_SPANISH, element.checked);
    }
  }

  sliderUpdate = function(element)
  {
      if (element.id == "spanishSpeechVolume" )
      {
        localStorage.setItem(PREFERENCE_KEYS.SPEAK_SPANISH_VOLUME, element.value);
      }
      else if (element.id == "soundEffectsVolume" )
      {
        localStorage.setItem(PREFERENCE_KEYS.SOUND_EFFECTS_VOLUME, element.value);
      }
      else if (element.id == "musicVolume")
      {
        localStorage.setItem(PREFERENCE_KEYS.MUSIC_VOLUME, element.value);
      }
      this.publishUpdates();
  }

  getValue = function(key)
  {
    let value = PREFERENCE_DEFAULTS[key];
    let valueString = localStorage.getItem(PREFERENCE_KEYS[key]);
    if (valueString) value = eval(valueString);
    return value;
  }



    //private ScreenCaller screenCaller;

/*
    public void addListener(OptionsLayoutListener listener)
    {
        listeners.add(listener);
    }
*/

/*
    public void showOptionsScreen(ScreenCaller screenCaller)
    {
        this.screenCaller = screenCaller;
        optionsLayout.loadSharedPreferences();
        optionsLayout.setVisibility(View.VISIBLE);
    }
*/
/*
    public void finishOptionsScreen()
    {
        optionsLayout.setVisibility(View.GONE);
        optionsLayout.saveSharedPreferences();
        notifyListeners();
    }

    public void notifyListeners()
    {
        for (OptionsLayoutListener listener: listeners)
        {
            listener.optionsUpdates();
        }
    }

    public OptionsLayout getLayout() {return optionsLayout;}

    public class OptionsLayout extends LinearLayout {

        private final SharedPreferences sharedPreferences;
        private final Context context;
        private final Switch speakSpanishButton;
        private final Slider musicVolumeSlider;
        private final TextView musicVolumeLabel;
        private final Slider noisesVolumeSlider;
        private final TextView noisesVolumeLabel;
        private final ArrayAdapter<Background.BACKGROUND_TYPE> backgroundTypeAdapter;
        private final Spinner landscapeOption;
        private final TextView landscapeOptionLabel;
        private final ArrayAdapter<TouchHandler.CONTROL_METHOD> controlMethodAdapter;
        private final Spinner controlMethodOption;
        private final TextView controlMethodLabel;
        private final Slider tiltSensitivitySlider;
        private final TextView tiltSensitivityLabel;
        private final LinearLayout tiltSensitivityLayout;
        private boolean suppressControlMethodDescription;



        Button doneButton;

        List<OptionsLayoutListener> updateListeners = new ArrayList<>();

        public OptionsLayout(Context context, SharedPreferences sharedPreferences)
        {
            super(context);
            this.context = context;
            this.sharedPreferences = sharedPreferences;
            this.setOrientation(VERTICAL);
            this.setGravity(TEXT_ALIGNMENT_CENTER);

            speakSpanishButton = new Switch(context);
            speakSpanishButton.setText(R.string.button_speak_spanish);
            speakSpanishButton.setTextSize(30);
            this.addView(speakSpanishButton);


            musicVolumeLabel = new TextView(context);
            musicVolumeLabel.setText(R.string.music_volume_label);
            musicVolumeLabel.setTextSize(30);
            musicVolumeSlider = new Slider(context);


            LinearLayout musicVolumeLayout = new LinearLayout(context);
            musicVolumeLayout.setOrientation(HORIZONTAL);
            musicVolumeLayout.addView(musicVolumeLabel);
            musicVolumeLayout.addView(musicVolumeSlider);
            this.addView(musicVolumeLayout);


            noisesVolumeLabel = new TextView(context);
            noisesVolumeLabel.setText(R.string.noises_volume_label);
            noisesVolumeLabel.setTextSize(30);
            noisesVolumeSlider = new Slider(context);

            LinearLayout noisesVolumeLayout = new LinearLayout(context);
            noisesVolumeLayout.setOrientation(HORIZONTAL);
            noisesVolumeLayout.addView(noisesVolumeLabel);
            noisesVolumeLayout.addView(noisesVolumeSlider);
            this.addView(noisesVolumeLayout);

            landscapeOption = new Spinner(context);
            backgroundTypeAdapter = new ArrayAdapter<>(context,
                    R.layout.options_spinner_item, Background.BACKGROUND_TYPE.values());
            landscapeOption.setAdapter(backgroundTypeAdapter);
            // todo: right-adjust spinner
            landscapeOptionLabel = new TextView(context);
            landscapeOptionLabel.setText(R.string.landscape_option_label);
            landscapeOptionLabel.setTextSize(30);
            LinearLayout landscapeOptionLayout = new LinearLayout(context);
            landscapeOptionLayout.setOrientation(HORIZONTAL);
            landscapeOptionLayout.addView(landscapeOptionLabel);
            landscapeOptionLayout.addView(landscapeOption);
            this.addView(landscapeOptionLayout);

            controlMethodOption = new Spinner(context);
            controlMethodAdapter = new ArrayAdapter<>(context,
                    R.layout.options_spinner_item, TouchHandler.CONTROL_METHOD.values());
            controlMethodOption.setAdapter(controlMethodAdapter);
            controlMethodLabel = new TextView(context);
            controlMethodLabel.setText(R.string.control_method_label);
            controlMethodLabel.setTextSize(30);
            LinearLayout controlMethodLayout = new LinearLayout(context);
            controlMethodLayout.setOrientation(HORIZONTAL);
            controlMethodLayout.addView(controlMethodLabel);
            controlMethodLayout.addView(controlMethodOption);
            this.addView(controlMethodLayout);

            controlMethodOption.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
                @Override
                public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                    TouchHandler.CONTROL_METHOD controlMethod = (TouchHandler.CONTROL_METHOD)controlMethodOption.getSelectedItem();
                    if (controlMethod == TouchHandler.CONTROL_METHOD.SINGLE_FINGER)
                        tiltSensitivityLayout.setVisibility(VISIBLE);
                    else
                        tiltSensitivityLayout.setVisibility(GONE);
                    // Show toast method, but only on manual selection.
                    if (!suppressControlMethodDescription) {
                        Toast message = Toast.makeText(context, controlMethod.getDescriptionResourceId(), Toast.LENGTH_LONG);
                        message.setGravity(Gravity.TOP, 0, 0);
                        message.show();
                    }
                    else
                        // If called again, will be a manual selection.
                        suppressControlMethodDescription = false;
                }

                @Override
                public void onNothingSelected(AdapterView<?> parent) {

                }
            });

            tiltSensitivityLayout = new LinearLayout(context);
            tiltSensitivityLabel = new TextView(context);
            tiltSensitivityLabel.setText(R.string.tilt_sensitivity_label);
            tiltSensitivityLabel.setTextSize(30);
            tiltSensitivityLayout.addView(tiltSensitivityLabel);
            tiltSensitivitySlider = new Slider(context);
            tiltSensitivitySlider.setValueFrom(TiltControl.MIN_TILT_SENSITIVITY);
            tiltSensitivitySlider.setValueTo(TiltControl.MAX_TILT_SENSITIVITY);
            tiltSensitivityLayout.addView(tiltSensitivitySlider);
            this.addView(tiltSensitivityLayout);


            doneButton = new Button(context);
            doneButton.setTypeface(ResourcesCompat.getFont(context, R.font.xoloniumregular));
            doneButton.setTextSize(40);
            doneButton.setText(R.string.doneButton);

            doneButton.setOnClickListener(v -> {
                finishOptionsScreen();
                screenCaller.returnedControl();
            });
            this.addView(doneButton);

        }

        public void loadSharedPreferences()
        {
            speakSpanishButton.setChecked(sharedPreferences.getBoolean(context.getString(R.string.preferences_speak_spanish), true));
            musicVolumeSlider.setValue(sharedPreferences.getFloat(context.getString(R.string.preferences_music_volume), 0.8f));
            noisesVolumeSlider.setValue(sharedPreferences.getFloat(context.getString(R.string.preferences_noises_volume), 0.8f));
            String backgroundTypeCode =
                    sharedPreferences.getString(context.getString(R.string.preferences_landscape_option),
                            Background.BACKGROUND_TYPE.getDefault().getCode());
            Background.BACKGROUND_TYPE backgroundType = Background.BACKGROUND_TYPE.lookup(backgroundTypeCode);
            landscapeOption.setSelection(backgroundTypeAdapter.getPosition(backgroundType));
            String controlMethodCode =
                    sharedPreferences.getString(context.getString(R.string.preferences_control_method),
                            TouchHandler.CONTROL_METHOD.getDefault().getCode());
            TouchHandler.CONTROL_METHOD controlMethod = TouchHandler.CONTROL_METHOD.lookup(controlMethodCode);
            suppressControlMethodDescription=true; // Don't cause this set to create a toast message.
            controlMethodOption.setSelection(controlMethodAdapter.getPosition(controlMethod));
            setTiltSensitivitySlider(sharedPreferences.getFloat(context.getString(R.string.preferences_tilt_sensitivity), TiltControl.DEFAULT_TILT_SENSITIVITY));
            if (controlMethod == TouchHandler.CONTROL_METHOD.SINGLE_FINGER)
                tiltSensitivityLayout.setVisibility(VISIBLE);
            else
                tiltSensitivityLayout.setVisibility(GONE);
        }

        public void saveSharedPreferences()
        {
            SharedPreferences.Editor editor = sharedPreferences.edit();
            editor.putBoolean(context.getString(R.string.preferences_speak_spanish), speakSpanishButton.isChecked());
            editor.putFloat(context.getString(R.string.preferences_music_volume), musicVolumeSlider.getValue());
            editor.putFloat(context.getString(R.string.preferences_noises_volume), noisesVolumeSlider.getValue());
            Background.BACKGROUND_TYPE backgroundType = (Background.BACKGROUND_TYPE)landscapeOption.getSelectedItem();
            editor.putString(context.getString(R.string.preferences_landscape_option), backgroundType.getCode());
            TouchHandler.CONTROL_METHOD controlMethod = (TouchHandler.CONTROL_METHOD)controlMethodOption.getSelectedItem();
            editor.putString(context.getString(R.string.preferences_control_method), controlMethod.getCode());
            editor.putFloat(context.getString(R.string.preferences_tilt_sensitivity), getTiltSensitivitySlider());
            editor.apply();
        }

        // Need to get/set sensitivity slider because the numbers need to be reversed (smaller number is more sensitive).
        private void setTiltSensitivitySlider(float tiltSensitivity)
        {
            tiltSensitivitySlider.setValue(TiltControl.MAX_TILT_SENSITIVITY-tiltSensitivity+TiltControl.MIN_TILT_SENSITIVITY);
        }
        private float getTiltSensitivitySlider()
        {
            return TiltControl.MAX_TILT_SENSITIVITY-tiltSensitivitySlider.getValue()+TiltControl.MIN_TILT_SENSITIVITY;
        }

    }
*/

}

class Subscriber {
  subscriberObject;
  subscriberFunction;
  constructor(subscriberObject, subscriberFunction)
  {
    this.subscriberObject=subscriberObject;
    this.subscriberFunction=subscriberFunction;
  }
}
