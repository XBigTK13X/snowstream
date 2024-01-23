package com.simplepathstudios.snowstream;

import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.widget.ProgressBar;
import android.widget.TextView;

public class LoadingIndicator {
    private static final String TAG = "LoadingIndicator";
    private static boolean isLoading;

    private static ProgressBar progressBar;
    private static TextView loadingText;

    public static void setLoading(boolean status){
        if(loadingText != null) {
            loadingText.setText("");
        }
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                isLoading = status;
                int visible = isLoading ? View.VISIBLE : View.INVISIBLE;
                progressBar.setVisibility(visible);
                loadingText.setVisibility(visible);
            }
        });
    }

    public static void setProgressBar(ProgressBar progressBar) {
        LoadingIndicator.progressBar = progressBar;
    }

    public static void setLoadingTextView(TextView textView){
        loadingText = textView;
    }

    public static void setLoadingMessage(String message){
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            @Override
            public void run() {
                loadingText.setText(message);
            }
        });
    }
}
