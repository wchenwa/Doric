package pub.doric.refresh;

/**
 * @Description: pub.doric.pullable
 * @Author: pengfei.zhou
 * @CreateDate: 2019-11-25
 */
public interface PullingListener {

    void startAnimation();

    void stopAnimation();

    /**
     * Set the amount of rotation to apply to the progress spinner.
     *
     * @param rotation Rotation is from [0..2]
     */
    void setPullingDistance(float rotation);
}
