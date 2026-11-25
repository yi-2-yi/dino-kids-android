package com.dinokids.encyclopedia.audio

import android.content.Context
import android.speech.tts.TextToSpeech
import java.util.Locale

class DinoSpeaker(context: Context) {
    private var tts: TextToSpeech? = null
    private var ready = false

    init {
        tts = TextToSpeech(context.applicationContext) { status ->
            ready = (status == TextToSpeech.SUCCESS)
        }
    }

    fun speak(text: String, locale: Locale, speechRate: Float = 0.88f) {
        val engine = tts ?: return
        if (!ready) return

        val availability = engine.isLanguageAvailable(locale)
        if (availability >= TextToSpeech.LANG_AVAILABLE) {
            engine.language = locale
        } else {
            // Fallback to default device language if specific voice pack isn't installed
            engine.language = Locale.getDefault()
        }
        engine.setSpeechRate(speechRate)
        engine.setPitch(1.06f)
        engine.speak(text, TextToSpeech.QUEUE_FLUSH, null, "dino_${System.currentTimeMillis()}")
    }

    fun speakZh(text: String) = speak(text, Locale.SIMPLIFIED_CHINESE, 0.90f)

    fun speakFr(text: String) = speak(text, Locale.FRENCH, 0.85f)

    fun speakEn(text: String) = speak(text, Locale.US, 0.85f)

    fun stop() {
        tts?.stop()
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
        ready = false
    }
}
